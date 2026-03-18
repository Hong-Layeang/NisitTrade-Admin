export default (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attached_product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    createdAt: 'sent_at',
    updatedAt: false,
  });

  Message.associate = models => {
    Message.belongsTo(models.User, {
      foreignKey: 'sender_id',
    });

    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
    });

    Message.belongsTo(models.Product, {
      foreignKey: 'attached_product_id',
      as: 'AttachedProduct',
    });

    Message.hasMany(models.MessageRead, {
      foreignKey: 'message_id',
      onDelete: 'CASCADE',
    });
  };

  return Message;
};
