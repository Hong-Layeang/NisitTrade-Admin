export default (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define('ConversationParticipant', {
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'conversation_participants',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['conversation_id', 'user_id']
      }
    ],
  });

  ConversationParticipant.associate = models => {
    ConversationParticipant.belongsTo(models.User, {
      foreignKey: 'user_id',
    });

    ConversationParticipant.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
    });
  };

  return ConversationParticipant;
};
