export default (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
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
    reportable_type: {
      type: DataTypes.ENUM('Product', 'CommunityPost'),
      allowNull: false,
    },
    reportable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'reports',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['reportable_type', 'reportable_id'],
        name: 'idx_reportable',
      },
      {
        fields: ['user_id'],
        name: 'idx_report_user_id',
      },
      {
        fields: ['status'],
        name: 'idx_report_status',
      },
    ],
  });

  Report.associate = models => {
    Report.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
    });
  };

  // Scope for getting Product reports
  Report.addScope('forProduct', (productId) => ({
    where: {
      reportable_type: 'Product',
      reportable_id: productId,
    },
  }));

  // Scope for getting CommunityPost reports
  Report.addScope('forCommunityPost', (communityPostId) => ({
    where: {
      reportable_type: 'CommunityPost',
      reportable_id: communityPostId,
    },
  }));

  // Scope for open reports
  Report.addScope('open', {
    where: {
      status: 'open',
    },
  });

  return Report;
};
