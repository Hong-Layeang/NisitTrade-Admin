import { Op } from 'sequelize';
import models, { connectDB } from '../../models/index.js';
import { writeActivityLog } from '../../utils/activity-log.js';

const {
  User,
  Product,
  ProductImage,
  CommunityPost,
  Like,
  Comment,
  SavedItem,
  Report,
  UserFollow,
  UserBlock,
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
} = models;

export default async function deleteUserController(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const requesterId = req.user?.id;

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (requesterId === targetUserId) {
      return res.status(400).json({ message: 'You cannot delete your own account from this endpoint' });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.role !== 'user') {
      return res.status(403).json({ message: 'Only user accounts can be deleted from this endpoint' });
    }

    const targetUserName = targetUser.full_name || `User #${targetUserId}`;

    await connectDB.transaction(async (transaction) => {
      await writeActivityLog({
        actionType: 'admin_banned_user',
        message: `Admin banned user: ${targetUserName}`,
        actorUserId: requesterId,
        actorRole: req.user?.role,
        targetType: 'User',
        targetId: targetUserId,
        transaction,
      });

      const [productRows, communityRows, participantRows] = await Promise.all([
        Product.findAll({ where: { user_id: targetUserId }, attributes: ['id'], transaction, raw: true }),
        CommunityPost.findAll({ where: { user_id: targetUserId }, attributes: ['id'], transaction, raw: true }),
        ConversationParticipant.findAll({ where: { user_id: targetUserId }, attributes: ['conversation_id'], transaction, raw: true }),
      ]);

      const productIds = productRows.map((row) => Number(row.id)).filter((id) => id > 0);
      const communityPostIds = communityRows.map((row) => Number(row.id)).filter((id) => id > 0);
      const conversationIds = participantRows
        .map((row) => Number(row.conversation_id))
        .filter((id) => Number.isInteger(id) && id > 0);

      await Promise.all([
        UserFollow.destroy({
          where: {
            [Op.or]: [{ follower_id: targetUserId }, { following_id: targetUserId }],
          },
          transaction,
        }),
        UserBlock.destroy({
          where: {
            [Op.or]: [{ blocker_id: targetUserId }, { blocked_id: targetUserId }],
          },
          transaction,
        }),
        Like.destroy({ where: { user_id: targetUserId }, transaction }),
        Comment.destroy({ where: { user_id: targetUserId }, transaction }),
        SavedItem.destroy({ where: { user_id: targetUserId }, transaction }),
        Report.destroy({
          where: {
            [Op.or]: [
              { user_id: targetUserId },
              { reportable_type: 'User', reportable_id: targetUserId },
            ],
          },
          transaction,
        }),
        MessageRead.destroy({ where: { user_id: targetUserId }, transaction }),
        Message.destroy({ where: { sender_id: targetUserId }, transaction }),
      ]);

      if (productIds.length > 0) {
        await Promise.all([
          Like.destroy({
            where: { likeable_type: 'Product', likeable_id: { [Op.in]: productIds } },
            transaction,
          }),
          Comment.destroy({
            where: { commentable_type: 'Product', commentable_id: { [Op.in]: productIds } },
            transaction,
          }),
          SavedItem.destroy({
            where: { saveable_type: 'Product', saveable_id: { [Op.in]: productIds } },
            transaction,
          }),
          Report.destroy({
            where: { reportable_type: 'Product', reportable_id: { [Op.in]: productIds } },
            transaction,
          }),
          ProductImage.destroy({ where: { product_id: { [Op.in]: productIds } }, transaction }),
          Conversation.destroy({ where: { product_id: { [Op.in]: productIds } }, transaction }),
          Product.destroy({ where: { id: { [Op.in]: productIds } }, transaction }),
        ]);
      }

      if (communityPostIds.length > 0) {
        await Promise.all([
          Like.destroy({
            where: { likeable_type: 'CommunityPost', likeable_id: { [Op.in]: communityPostIds } },
            transaction,
          }),
          Comment.destroy({
            where: { commentable_type: 'CommunityPost', commentable_id: { [Op.in]: communityPostIds } },
            transaction,
          }),
          SavedItem.destroy({
            where: { saveable_type: 'CommunityPost', saveable_id: { [Op.in]: communityPostIds } },
            transaction,
          }),
          Report.destroy({
            where: { reportable_type: 'CommunityPost', reportable_id: { [Op.in]: communityPostIds } },
            transaction,
          }),
          CommunityPost.destroy({ where: { id: { [Op.in]: communityPostIds } }, transaction }),
        ]);
      }

      if (conversationIds.length > 0) {
        await ConversationParticipant.destroy({
          where: {
            conversation_id: { [Op.in]: conversationIds },
            user_id: targetUserId,
          },
          transaction,
        });
      }

      await targetUser.destroy({ transaction });
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
}
