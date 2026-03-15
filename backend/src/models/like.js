export default (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    likeable_type: {
      type: DataTypes.ENUM('Product', 'CommunityPost'),
      allowNull: false,
    },
    likeable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'likes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['likeable_type', 'likeable_id', 'user_id'],
        name: 'idx_unique_likeable_user',
      },
      {
        fields: ['likeable_type', 'likeable_id'],
        name: 'idx_likeable',
      },
      {
        fields: ['user_id'],
        name: 'idx_like_user_id',
      },
    ],
  });

  Like.associate = models => {
    Like.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  // Scope for getting Product likes
  Like.addScope('forProduct', (productId) => ({
    where: {
      likeable_type: 'Product',
      likeable_id: productId,
    },
  }));

  // Scope for getting CommunityPost likes
  Like.addScope('forCommunityPost', (communityPostId) => ({
    where: {
      likeable_type: 'CommunityPost',
      likeable_id: communityPostId,
    },
  }));

  return Like;
};
