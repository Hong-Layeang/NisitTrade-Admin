export default (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
  });

  Conversation.associate = models => {
    Conversation.belongsTo(models.Product, {
      foreignKey: 'product_id',
    });

    Conversation.hasMany(models.Message, {
      foreignKey: 'conversation_id',
      onDelete: 'CASCADE',
    });
  };

  return Conversation;
};
