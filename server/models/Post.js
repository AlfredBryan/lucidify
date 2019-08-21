const post = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    post: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Post.associate = models => {
    Post.belongsToMany(models.User, {
      through: {
        unique: false,
        model: models.Comment
      },
      foreignKey: "postId"
    });
    Post.belongsTo(models.User, {
      foreignKey: "userId"
    });
    Post.hasMany(models.Like, {
      foreignKey: "postId"
    });
  };

  return Post;
};

module.exports = post;
