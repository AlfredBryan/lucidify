const express = require("express");
const Validator = require("validator");

const models = require("../models/index");

const router = express.Router();

//Add comments to post
router.post("/post/:id", async (req, res) => {
  let newComment = null;
  const { comment } = req.body;
  try {
    const post = await models.Post.findOne({
      where: { id: req.params.id }
    });

    const user = await models.User.findOne({
      where: { id: req.body.userId }
    });
    newComment = await user.addPost([post], {
      through: {
        comment: comment
      }
    });
  } catch (error) {
    res.status(200).send(newComment);
  }
});

module.exports = router;
