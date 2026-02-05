export default (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'product_images',
    timestamps: true,
    underscored: true,
  });

  ProductImage.associate = models => {
    ProductImage.belongsTo(models.Product, {
      foreignKey: 'product_id',
    });
  };

  return ProductImage;
};
