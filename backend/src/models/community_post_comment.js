export default (sequelize, DataTypes) => {
  const CommunityPostComment = sequelize.define('CommunityPostComment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500],
      },
    },
  }, {
    tableName: 'community_post_comments',
    timestamps: true,
    underscored: true,
  });

  CommunityPostComment.associate = models => {
    CommunityPostComment.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    CommunityPostComment.belongsTo(models.CommunityPost, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });
  };

  return CommunityPostComment;
};