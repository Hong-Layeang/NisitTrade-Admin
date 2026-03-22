export default (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'ratings',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['seller_id'], name: 'idx_rating_seller_id' },
      { fields: ['buyer_id'], name: 'idx_rating_buyer_id' },
      { fields: ['product_id'], name: 'idx_rating_product_id' },
      {
        unique: true,
        fields: ['buyer_id', 'product_id'],
        name: 'uq_rating_buyer_product',
      },
    ],
  });

  Rating.associate = models => {
    Rating.belongsTo(models.User, {
      as: 'Buyer',
      foreignKey: 'buyer_id',
      onDelete: 'CASCADE',
    });
    Rating.belongsTo(models.User, {
      as: 'Seller',
      foreignKey: 'seller_id',
      onDelete: 'CASCADE',
    });
    Rating.belongsTo(models.Product, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });
  };

  return Rating;
};
