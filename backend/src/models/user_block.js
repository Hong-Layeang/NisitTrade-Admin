export default (sequelize, DataTypes) => {
  const UserBlock = sequelize.define('UserBlock', {
    blocker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    blocked_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'user_blocks',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['blocker_id', 'blocked_id'] },
    ],
  });

  UserBlock.associate = models => {
    UserBlock.belongsTo(models.User, {
      as: 'Blocker',
      foreignKey: 'blocker_id',
    });
    UserBlock.belongsTo(models.User, {
      as: 'Blocked',
      foreignKey: 'blocked_id',
    });
  };

  return UserBlock;
};
