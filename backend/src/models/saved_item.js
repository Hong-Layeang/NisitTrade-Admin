export default (sequelize, DataTypes) => {
  const SavedItem = sequelize.define('SavedItem', {
    saveable_type: {
      type: DataTypes.ENUM('Product', 'CommunityPost'),
      allowNull: false,
    },
    saveable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'saved_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['saveable_type', 'saveable_id', 'user_id'],
        name: 'idx_unique_saveable_user',
      },
      {
        fields: ['saveable_type', 'saveable_id'],
        name: 'idx_saveable',
      },
      {
        fields: ['user_id'],
        name: 'idx_saved_item_user_id',
      },
    ],
  });

  SavedItem.associate = models => {
    SavedItem.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  // Scope for getting saved Products
  SavedItem.addScope('forProduct', (productId) => ({
    where: {
      saveable_type: 'Product',
      saveable_id: productId,
    },
  }));

  // Scope for getting saved CommunityPosts
  SavedItem.addScope('forCommunityPost', (communityPostId) => ({
    where: {
      saveable_type: 'CommunityPost',
      saveable_id: communityPostId,
    },
  }));

  return SavedItem;
};
