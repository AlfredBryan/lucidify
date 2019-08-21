const user = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  User.associate = function(models) {
    User.belongsToMany(models.Post, {
      through: {
        unique: false,
        model: models.Comment
      },
      foreignKey: "userId"
    });
    User.hasMany(models.Post, {
      foreignKey: "userId"
    });
    User.hasMany(models.Like, {
      foreignKey: "userId"
    });
  };

  return User;
};

module.exports = user;
