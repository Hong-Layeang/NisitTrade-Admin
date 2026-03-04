export default (sequelize, DataTypes) => {
  const UserFollow = sequelize.define('UserFollow', {
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'user_follows',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['follower_id', 'following_id'] },
    ],
  });

  UserFollow.associate = models => {
    // A follow record belongs to the user who follows (follower)
    UserFollow.belongsTo(models.User, {
      as: 'Follower',
      foreignKey: 'follower_id',
    });
    // A follow record belongs to the user being followed
    UserFollow.belongsTo(models.User, {
      as: 'Following',
      foreignKey: 'following_id',
    });
  };

  return UserFollow;
};
