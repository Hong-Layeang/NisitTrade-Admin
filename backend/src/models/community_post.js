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

    // associations
    CommunityPost.hasMany(models.Like, {
      foreignKey: 'likeable_id',
      constraints: false,
      scope: {
        likeable_type: 'CommunityPost',
      },
      as: 'Likes',
    });

    CommunityPost.hasMany(models.Comment, {
      foreignKey: 'commentable_id',
      constraints: false,
      scope: {
        commentable_type: 'CommunityPost',
      },
      as: 'Comments',
    });

    CommunityPost.hasMany(models.SavedItem, {
      foreignKey: 'saveable_id',
      constraints: false,
      scope: {
        saveable_type: 'CommunityPost',
      },
      as: 'SavedItems',
    });
  };

  return CommunityPost;
};
