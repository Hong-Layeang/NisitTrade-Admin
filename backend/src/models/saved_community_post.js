export default (sequelize, DataTypes) => {
  const SavedCommunityPost = sequelize.define('SavedCommunityPost', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  }, {
    tableName: 'saved_community_posts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'community_post_id'],
      },
    ],
  });

  SavedCommunityPost.associate = models => {
    SavedCommunityPost.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    SavedCommunityPost.belongsTo(models.CommunityPost, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });
  };

  return SavedCommunityPost;
};
