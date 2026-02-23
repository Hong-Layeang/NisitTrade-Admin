export default (sequelize, DataTypes) => {
  const ProductReport = sequelize.define('ProductReport', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'reviewing', 'closed'),
      defaultValue: 'open',
    },
  }, {
    tableName: 'product_reports',
    timestamps: true,
    underscored: true,
  });

  ProductReport.associate = models => {
    ProductReport.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
    });

    ProductReport.belongsTo(models.Product, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });
  };

  return ProductReport;
};
