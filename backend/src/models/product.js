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

    Product.hasMany(models.Like, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });

    Product.hasMany(models.Comment, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });

    Product.hasMany(models.SavedListing, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });

    Product.hasMany(models.ProductReport, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });
  };

  return Product;
};
