import { Op } from 'sequelize';

import models from '../models/index.js';

const { UserBlock } = models;

export async function getUserBlockStatuses(userId, otherUserIds) {
  const normalizedOtherUserIds = [...new Set(
    otherUserIds
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0 && value !== Number(userId)),
  )];

  const statusMap = new Map();
  for (const finalUserId of normalizedOtherUserIds) {
    statusMap.set(finalUserId, {
      isBlockedByMe: false,
      hasBlockedMe: false,
    });
  }

  if (normalizedOtherUserIds.length === 0) {
    return statusMap;
  }

  const blocks = await UserBlock.findAll({
    where: {
      [Op.or]: [
        {
          blocker_id: userId,
          blocked_id: { [Op.in]: normalizedOtherUserIds },
        },
        {
          blocker_id: { [Op.in]: normalizedOtherUserIds },
          blocked_id: userId,
        },
      ],
    },
    attributes: ['blocker_id', 'blocked_id'],
  });

  for (const block of blocks) {
    const blockerId = Number(block.blocker_id);
    const blockedId = Number(block.blocked_id);

    if (blockerId === Number(userId)) {
      const existing = statusMap.get(blockedId) ?? {
        isBlockedByMe: false,
        hasBlockedMe: false,
      };
      existing.isBlockedByMe = true;
      statusMap.set(blockedId, existing);
      continue;
    }

    if (blockedId === Number(userId)) {
      const existing = statusMap.get(blockerId) ?? {
        isBlockedByMe: false,
        hasBlockedMe: false,
      };
      existing.hasBlockedMe = true;
      statusMap.set(blockerId, existing);
    }
  }

  return statusMap;
}

export async function getUserBlockStatus(userId, otherUserId) {
  const statusMap = await getUserBlockStatuses(userId, [otherUserId]);
  return statusMap.get(Number(otherUserId)) ?? {
    isBlockedByMe: false,
    hasBlockedMe: false,
  };
}
