const like = (sequelize, DataTypes) => {
  const Like = sequelize.define("Like", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    postId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  Like.associate = models => {
    Like.belongsTo(models.User, {
      foreignKey: "userId",
    });
    Like.belongsTo(models.Post, {
      foreignKey: "postId",
    });
  };

  return Like;
};

module.exports = like;
