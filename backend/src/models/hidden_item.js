export default (sequelize, DataTypes) => {
  const HiddenItem = sequelize.define('HiddenItem', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hideable_type: {
      type: DataTypes.ENUM('Product', 'CommunityPost'),
      allowNull: false,
    },
    hideable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'hidden_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'hideable_type', 'hideable_id'],
      },
      {
        fields: ['hideable_type', 'hideable_id'],
      },
    ],
  });

  HiddenItem.associate = models => {
    HiddenItem.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return HiddenItem;
};