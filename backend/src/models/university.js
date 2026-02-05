export default (sequelize, DataTypes) => {
  const University = sequelize.define('University', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'universities',
    timestamps: true,
    underscored: true,
  });

  University.associate = models => {
    University.hasMany(models.User, {
      foreignKey: 'university_id',
    });
  };

  return University;
};
