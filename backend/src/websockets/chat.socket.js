import { Op } from 'sequelize';
import models from '../models/index.js';

const { Message, ConversationParticipant, User, Product, ProductImage, MessageRead } = models;

/**
 * Initialize chat WebSocket handlers on the existing Socket.io server.
 * Users auto-join `conversation:<id>` rooms for each conversation they participate in.
 * Events:
 *   - chat:join         { conversationId }
 *   - chat:leave        { conversationId }
 *   - chat:send         { conversationId, messageText }
 *   - chat:edit         { messageId, messageText }
 *   - chat:delete       { messageIds }
 *   - chat:typing       { conversationId }
 *   - chat:stop_typing  { conversationId }
 *
 * Server → Client events:
 *   - chat:receive      full message JSON
 *   - chat:updated      { messageId, conversationId, messageText, editedAt }
 *   - chat:deleted      { messageIds, conversationId }
 *   - chat:typing       { conversationId, userId }
 *   - chat:stop_typing  { conversationId, userId }
 *   - chat:read         { messageId, conversationId, userId, readAt }
 */

async function getParticipantConversationIds(userId) {
  const rows = await ConversationParticipant.findAll({
    where: { user_id: userId },
    attributes: ['conversation_id'],
    raw: true,
  });
  return rows.map((r) => r.conversation_id);
}

async function isParticipant(userId, conversationId) {
  const row = await ConversationParticipant.findOne({
    where: { conversation_id: conversationId, user_id: userId },
    attributes: ['id'],
  });
  return Boolean(row);
}

function roomName(conversationId) {
  return `conversation:${conversationId}`;
}

async function fetchFullMessage(messageId) {
  return Message.findByPk(messageId, {
    include: [
      {
        model: User,
        attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id'],
      },
      {
        model: Product,
        as: 'AttachedProduct',
        attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at'],
        include: [{ model: ProductImage, attributes: ['id', 'image_url', 'product_id', 'created_at', 'updated_at'] }],
      },
      {
        model: MessageRead,
        attributes: ['message_id', 'user_id', 'read_at'],
      },
    ],
  });
}

export function initChatSocket(io) {
  io.on('connection', async (socket) => {
    const userId = socket.data?.user?.id;
    if (!userId) return;

    // Auto-join rooms for all conversations the user participates in
    try {
      const conversationIds = await getParticipantConversationIds(userId);
      for (const cid of conversationIds) {
        socket.join(roomName(cid));
      }
    } catch (err) {
      console.error('[ChatSocket] Failed to auto-join rooms:', err.message);
    }

    // Explicit join (e.g. after creating a new conversation)
    socket.on('chat:join', async (payload) => {
      try {
        const conversationId = Number(payload?.conversationId);
        if (!conversationId || !(await isParticipant(userId, conversationId))) return;
        socket.join(roomName(conversationId));
      } catch (err) {
        console.error('[ChatSocket] chat:join error:', err.message);
      }
    });

    socket.on('chat:leave', (payload) => {
      const conversationId = Number(payload?.conversationId);
      if (conversationId) socket.leave(roomName(conversationId));
    });

    // Send a text-only message via WebSocket (images still go through REST)
    socket.on('chat:send', async (payload, ack) => {
      try {
        const conversationId = Number(payload?.conversationId);
        const messageText = String(payload?.messageText ?? '').trim();
        if (!conversationId || !messageText) return;
        if (!(await isParticipant(userId, conversationId))) return;

        const msg = await Message.create({
          conversation_id: conversationId,
          sender_id: userId,
          message_text: messageText,
          image_urls: [],
        });

        const full = await fetchFullMessage(msg.id);
        io.to(roomName(conversationId)).emit('chat:receive', full.toJSON());
        if (typeof ack === 'function') ack({ ok: true, message: full.toJSON() });
      } catch (err) {
        console.error('[ChatSocket] chat:send error:', err.message);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    // Read receipt via WebSocket
    socket.on('chat:read', async (payload) => {
      try {
        const messageId = Number(payload?.messageId);
        if (!messageId) return;

        const msg = await Message.findByPk(messageId, { attributes: ['id', 'conversation_id'] });
        if (!msg) return;
        if (!(await isParticipant(userId, msg.conversation_id))) return;

        await MessageRead.findOrCreate({
          where: { message_id: messageId, user_id: userId },
          defaults: { read_at: new Date() },
        });

        io.to(roomName(msg.conversation_id)).emit('chat:read', {
          messageId,
          conversationId: msg.conversation_id,
          userId,
          readAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[ChatSocket] chat:read error:', err.message);
      }
    });

    // Typing indicators
    socket.on('chat:typing', (payload) => {
      const conversationId = Number(payload?.conversationId);
      if (conversationId) {
        socket.to(roomName(conversationId)).emit('chat:typing', { conversationId, userId });
      }
    });

    socket.on('chat:stop_typing', (payload) => {
      const conversationId = Number(payload?.conversationId);
      if (conversationId) {
        socket.to(roomName(conversationId)).emit('chat:stop_typing', { conversationId, userId });
      }
    });

    // Edit a message via WebSocket
    socket.on('chat:edit', async (payload, ack) => {
      try {
        const messageId = Number(payload?.messageId);
        const messageText = String(payload?.messageText ?? '').trim();
        if (!messageId || !messageText) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Invalid payload' });
          return;
        }

        const msg = await Message.findByPk(messageId);
        if (!msg) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Message not found' });
          return;
        }

        if (msg.sender_id !== userId) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Forbidden' });
          return;
        }

        if (!(await isParticipant(userId, msg.conversation_id))) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Forbidden' });
          return;
        }

        const now = new Date();
        await msg.update({ message_text: messageText, edited_at: now });

        const result = {
          messageId: msg.id,
          conversationId: msg.conversation_id,
          messageText,
          editedAt: now.toISOString(),
        };

        io.to(roomName(msg.conversation_id)).emit('chat:updated', result);
        if (typeof ack === 'function') ack({ ok: true, ...result });
      } catch (err) {
        console.error('[ChatSocket] chat:edit error:', err.message);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    // Delete messages via WebSocket
    socket.on('chat:delete', async (payload, ack) => {
      try {
        const rawIds = payload?.messageIds;
        if (!Array.isArray(rawIds) || rawIds.length === 0) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Invalid payload' });
          return;
        }

        const ids = rawIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0);
        if (ids.length === 0) {
          if (typeof ack === 'function') ack({ ok: false, error: 'No valid IDs' });
          return;
        }

        const messages = await Message.findAll({
          where: { id: { [Op.in]: ids } },
          attributes: ['id', 'sender_id', 'conversation_id'],
        });

        if (messages.length === 0) {
          if (typeof ack === 'function') ack({ ok: false, error: 'No messages found' });
          return;
        }

        const notOwned = messages.filter((m) => m.sender_id !== userId);
        if (notOwned.length > 0) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Forbidden' });
          return;
        }

        const conversationIds = [...new Set(messages.map((m) => m.conversation_id))];
        for (const cid of conversationIds) {
          if (!(await isParticipant(userId, cid))) {
            if (typeof ack === 'function') ack({ ok: false, error: 'Forbidden' });
            return;
          }
        }

        const deletedIds = messages.map((m) => m.id);
        await MessageRead.destroy({ where: { message_id: { [Op.in]: deletedIds } } });
        await Message.destroy({ where: { id: { [Op.in]: deletedIds } } });

        for (const cid of conversationIds) {
          const idsForConv = messages
            .filter((m) => m.conversation_id === cid)
            .map((m) => m.id);
          io.to(roomName(cid)).emit('chat:deleted', { messageIds: idsForConv, conversationId: cid });
        }

        if (typeof ack === 'function') ack({ ok: true, deleted: deletedIds });
      } catch (err) {
        console.error('[ChatSocket] chat:delete error:', err.message);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });
  });
}

/**
 * Broadcast a message update to all participants in a conversation.
 * Called from REST edit/delete controllers.
 */
export function broadcastMessageUpdate(io, conversationId, payload) {
  if (!io) return;
  io.to(roomName(conversationId)).emit('chat:updated', payload);
}

export function broadcastMessageDelete(io, conversationId, messageIds) {
  if (!io) return;
  io.to(roomName(conversationId)).emit('chat:deleted', { messageIds, conversationId });
}

export function broadcastNewMessage(io, conversationId, messageJson) {
  if (!io) return;
  io.to(roomName(conversationId)).emit('chat:receive', messageJson);
}
