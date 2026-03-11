export default (sequelize, DataTypes) => {
  const CommunityPostReport = sequelize.define('CommunityPostReport', {
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
      allowNull: false,
      defaultValue: 'open',
    },
  }, {
    tableName: 'community_post_reports',
    timestamps: true,
    underscored: true,
  });

  CommunityPostReport.associate = models => {
    CommunityPostReport.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
    });

    CommunityPostReport.belongsTo(models.CommunityPost, {
      foreignKey: 'community_post_id',
      onDelete: 'CASCADE',
    });
  };

  return CommunityPostReport;
};
