export default (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    action_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actor_role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    tableName: 'activity_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false,
    indexes: [
      { fields: ['action_type'], name: 'idx_activity_log_action_type' },
      { fields: ['actor_user_id'], name: 'idx_activity_log_actor_user_id' },
      { fields: ['created_at'], name: 'idx_activity_log_created_at' },
    ],
  });

  ActivityLog.associate = models => {
    ActivityLog.belongsTo(models.User, {
      as: 'Actor',
      foreignKey: 'actor_user_id',
      constraints: false,
    });
  };

  return ActivityLog;
};
