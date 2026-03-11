export default (sequelize, DataTypes) => {
  const CommunityPostLike = sequelize.define('CommunityPostLike', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  }, {
    tableName: 'community_post_likes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['community_post_id', 'user_id'],
      },
    ],
  });

  CommunityPostLike.associate = models => {
    CommunityPostLike.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    CommunityPostLike.belongsTo(models.CommunityPost, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });
  };

  return CommunityPostLike;
};