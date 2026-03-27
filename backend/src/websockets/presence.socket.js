import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

import models from '../models/index.js';
import { getJwtSecret } from '../utils/helper/auth.helpers.js';

const { User } = models;

const userSockets = new Map();
const socketUsers = new Map();

const PRESENCE_CACHE_TTL_MS = 30_000;
const userLastSeenCache = new Map();

let ioRef = null;

function toUserId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function upsertSocket(userId, socketId) {
  const existing = userSockets.get(userId);
  if (existing) {
    existing.add(socketId);
    return existing.size === 1;
  }

  userSockets.set(userId, new Set([socketId]));
  return true;
}

function removeSocket(socketId) {
  const userId = socketUsers.get(socketId);
  if (!userId) {
    return { userId: null, becameOffline: false };
  }

  socketUsers.delete(socketId);
  const sockets = userSockets.get(userId);
  if (!sockets) {
    return { userId, becameOffline: false };
  }

  sockets.delete(socketId);
  if (sockets.size > 0) {
    return { userId, becameOffline: false };
  }

  userSockets.delete(userId);
  return { userId, becameOffline: true };
}

function isUserOnline(userId) {
  const normalized = toUserId(userId);
  if (!normalized) {
    return false;
  }
  const sockets = userSockets.get(normalized);
  return Boolean(sockets && sockets.size > 0);
}

function getCachedLastSeenAt(userId) {
  const cached = userLastSeenCache.get(userId);
  if (!cached) {
    return null;
  }

  if (Date.now() - cached.updatedAt > PRESENCE_CACHE_TTL_MS) {
    userLastSeenCache.delete(userId);
    return null;
  }

  return cached.lastSeenAt;
}

function hasCachedEntry(userId) {
  const cached = userLastSeenCache.get(userId);
  if (!cached) return false;
  if (Date.now() - cached.updatedAt > PRESENCE_CACHE_TTL_MS) {
    userLastSeenCache.delete(userId);
    return false;
  }
  return true;
}

function setCachedLastSeenAt(userId, lastSeenAt) {
  const normalized = toUserId(userId);
  if (!normalized) {
    return;
  }

  userLastSeenCache.set(normalized, {
    lastSeenAt: lastSeenAt ?? null,
    updatedAt: Date.now(),
  });
}

function emitPresenceChanged(payload) {
  if (!ioRef) {
    return;
  }
  ioRef.emit('presence:changed', payload);
}

function buildPresencePayload(userId, lastSeenAt = null) {
  const normalized = toUserId(userId);
  if (!normalized) {
    return null;
  }

  return {
    user_id: normalized,
    is_online: isUserOnline(normalized),
    last_seen_at: lastSeenAt,
  };
}

export async function getPresenceForUserIds(userIds) {
  const normalizedIds = Array.from(new Set(
    (Array.isArray(userIds) ? userIds : [])
      .map((id) => toUserId(id))
      .filter(Boolean)
  ));

  if (normalizedIds.length === 0) {
    return new Map();
  }

  const presenceMap = new Map();
  const idsToFetch = [];

  for (const id of normalizedIds) {
    const cachedLastSeenAt = getCachedLastSeenAt(id);
    if (hasCachedEntry(id) || isUserOnline(id)) {
      presenceMap.set(id, {
        user_id: id,
        is_online: isUserOnline(id),
        last_seen_at: cachedLastSeenAt,
      });
      continue;
    }

    idsToFetch.push(id);
  }

  if (idsToFetch.length > 0) {
    try {
      const users = await User.findAll({
        where: {
          id: { [Op.in]: idsToFetch },
        },
        attributes: ['id', 'last_seen_at'],
        raw: true,
      });

      for (const user of users) {
        const id = toUserId(user.id);
        if (!id) {
          continue;
        }

        const lastSeenAt = user.last_seen_at ?? null;
        setCachedLastSeenAt(id, lastSeenAt);
        presenceMap.set(id, {
          user_id: id,
          is_online: isUserOnline(id),
          last_seen_at: lastSeenAt,
        });
      }
    } catch (error) {
      console.error('Failed to fetch presence from DB:', error.message);
    }
  }

  for (const id of normalizedIds) {
    if (presenceMap.has(id)) {
      continue;
    }

    presenceMap.set(id, {
      user_id: id,
      is_online: isUserOnline(id),
      last_seen_at: getCachedLastSeenAt(id),
    });
  }

  return presenceMap;
}

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function socketAuthMiddleware(socket, next) {
  try {
    const tokenFromAuth = socket.handshake?.auth?.token;
    const tokenFromHeader = extractBearerToken(
      socket.handshake?.headers?.authorization
    );
    const token = tokenFromAuth || tokenFromHeader;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const userId = toUserId(decoded?.id);
    if (!userId) {
      return next(new Error('Unauthorized'));
    }

    socket.data.user = {
      id: userId,
      role: decoded?.role,
    };

    return next();
  } catch (error) {
    return next(new Error('Unauthorized'));
  }
}

async function handleDisconnect(socketId) {
  const { userId, becameOffline } = removeSocket(socketId);
  if (!userId || !becameOffline) {
    return;
  }

  const now = new Date();
  await User.update(
    { last_seen_at: now },
    { where: { id: userId } }
  );
  setCachedLastSeenAt(userId, now.toISOString());

  emitPresenceChanged({
    user_id: userId,
    is_online: false,
    last_seen_at: now.toISOString(),
  });
}

export function initPresenceSocket(io) {
  ioRef = io;

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    const userId = toUserId(socket.data?.user?.id);
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socketUsers.set(socket.id, userId);
    const becameOnline = upsertSocket(userId, socket.id);

    socket.join(`user:${userId}`);

    try {
      const selfPresenceMap = await getPresenceForUserIds([userId]);
      const selfPresence = selfPresenceMap.get(userId) ?? {
        user_id: userId,
        is_online: true,
        last_seen_at: null,
      };
      socket.emit('presence:snapshot', { users: [selfPresence] });
    } catch (error) {
      socket.emit('presence:snapshot', {
        users: [{ user_id: userId, is_online: true, last_seen_at: null }],
      });
    }

    if (becameOnline) {
      emitPresenceChanged({
        user_id: userId,
        is_online: true,
        last_seen_at: null,
      });
    }

    socket.on('presence:watch', async (payload = {}) => {
      try {
        const userIds = Array.isArray(payload?.user_ids)
          ? payload.user_ids.slice(0, 300)
          : [];
        const presenceMap = await getPresenceForUserIds(userIds);
        socket.emit('presence:snapshot', {
          users: Array.from(presenceMap.values()),
        });
      } catch (error) {
        socket.emit('presence:snapshot', { users: [] });
      }
    });

    socket.on('disconnect', async () => {
      try {
        await handleDisconnect(socket.id);
      } catch (error) {
        console.error('Failed to handle presence disconnect:', error);
      }
    });
  });
}

export function getCurrentPresence(userId) {
  return buildPresencePayload(userId, null);
}
