export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500],
      },
    },
    commentable_type: {
      type: DataTypes.ENUM('Product', 'CommunityPost'),
      allowNull: false,
    },
    commentable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['commentable_type', 'commentable_id'],
        name: 'idx_commentable',
      },
      {
        fields: ['user_id'],
        name: 'idx_comment_user_id',
      },
    ],
  });

  Comment.associate = models => {
    Comment.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  // Scope for getting Product comments
  Comment.addScope('forProduct', (productId) => ({
    where: {
      commentable_type: 'Product',
      commentable_id: productId,
    },
  }));

  // Scope for getting CommunityPost comments
  Comment.addScope('forCommunityPost', (communityPostId) => ({
    where: {
      commentable_type: 'CommunityPost',
      commentable_id: communityPostId,
    },
  }));

  return Comment;
};
