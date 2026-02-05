export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });

  User.associate = models => {
    User.belongsTo(models.University, {
      foreignKey: 'university_id',
    });

    User.hasMany(models.Product, {
      foreignKey: 'user_id',
    });
  };

  return User;
};
