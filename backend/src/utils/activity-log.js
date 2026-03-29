import models from '../models/index.js';

const { ActivityLog } = models;

export async function writeActivityLog({
  actionType,
  message,
  actorUserId,
  actorRole,
  targetType,
  targetId,
  metadata = {},
  transaction,
}) {
  if (!actionType || !message) return;

  try {
    await ActivityLog.create({
      action_type: actionType,
      message,
      actor_user_id: actorUserId || null,
      actor_role: actorRole || null,
      target_type: targetType || null,
      target_id: Number.isInteger(targetId) ? targetId : null,
      metadata,
    }, transaction ? { transaction } : undefined);
  } catch (error) {
    console.error('Activity log write failed:', error.message);
  }
}
