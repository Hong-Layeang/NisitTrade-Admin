export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  });

  Category.associate = models => {
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
    });
  };

  return Category;
};
