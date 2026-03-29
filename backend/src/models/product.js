export default (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'sold', 'hidden'),
      defaultValue: 'available',
    },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  });

  Product.associate = models => {
    Product.belongsTo(models.User, {
      foreignKey: 'user_id',
    });

    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
    });

    Product.hasMany(models.ProductImage, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });

    // associations
    Product.hasMany(models.Like, {
      foreignKey: 'likeable_id',
      constraints: false,
      scope: {
        likeable_type: 'Product',
      },
      as: 'Likes',
    });

    Product.hasMany(models.Comment, {
      foreignKey: 'commentable_id',
      constraints: false,
      scope: {
        commentable_type: 'Product',
      },
      as: 'Comments',
    });

    Product.hasMany(models.SavedItem, {
      foreignKey: 'saveable_id',
      constraints: false,
      scope: {
        saveable_type: 'Product',
      },
      as: 'SavedItems',
    });

    Product.hasMany(models.HiddenItem, {
      foreignKey: 'hideable_id',
      constraints: false,
      scope: {
        hideable_type: 'Product',
      },
      as: 'HiddenItems',
    });
  };

  return Product;
};
