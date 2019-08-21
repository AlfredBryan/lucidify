const comment = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
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
      defaultValue: DataTypes.UUIDV4
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Comment.associate = models => {
    Comment.belongsTo(models.User, {
      foreignKey: "userId",
      sourceKey: models.User.id
    });
    Comment.belongsTo(models.Post, {
      foreignKey: "postId",
      sourceKey: models.Post.id
    });
  };

  return Comment;
};

module.exports = comment;
