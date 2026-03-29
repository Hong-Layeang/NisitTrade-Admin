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
      allowNull: true,
    },
    password_set: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    profile_image: {
      type: DataTypes.STRING,
    },
    cover_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    major: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'local',
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
    last_seen_at: {
      type: DataTypes.DATE,
      allowNull: true,
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

    User.hasMany(models.UserFollow, {
      as: 'Followers',
      foreignKey: 'following_id',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.UserFollow, {
      as: 'Following',
      foreignKey: 'follower_id',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Product, {
      foreignKey: 'user_id',
    });

    User.hasMany(models.SavedItem, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Report, {
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
    });

    User.hasMany(models.HiddenItem, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return User;
};
