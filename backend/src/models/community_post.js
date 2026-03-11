export default (sequelize, DataTypes) => {
  const CommunityPost = sequelize.define('CommunityPost', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    likes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    comments_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'community_posts',
    timestamps: true,
    underscored: true,
  });

  CommunityPost.associate = models => {
    CommunityPost.belongsTo(models.User, {
      foreignKey: 'user_id',
    });

    CommunityPost.hasMany(models.CommunityPostLike, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });

    CommunityPost.hasMany(models.CommunityPostComment, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });

    CommunityPost.hasMany(models.CommunityPostReport, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });

    CommunityPost.hasMany(models.SavedCommunityPost, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });
  };

  return CommunityPost;
};
