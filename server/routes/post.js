const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const Validator = require("validator");
require("dotenv").config();

const models = require("../models/index");

const router = express.Router();

// Image Upload Configuration with multer and cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "lucidify",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 200, height: 200, crop: "limit" }]
});

const upload = multer({ storage: storage }).single("image");

//User can view all post with comments and likes
router.get("/posts", (req, res) => {
  models.Post.findAll({
    include: [
      {
        model: models.Comment
      },
      {
        model: models.Like
      }
    ]
  })
    .then(posts => {
      if (posts.length < 1) {
        res.status(404).send({ message: "No post found" });
      } else {
        res.status(200).send({ success: true, data: posts });
      }
    })
    .catch(error => {
      res.status(500).send("Error" + error);
    });
});

//Authenticated User can create post
router.post("/post", upload, (req, res) => {
  const errors = [];
  const { creatorId, title, post } = req.body;

  if (Validator.isEmpty(title)) {
    errors.push({ message: "title field is required" });
  }
  if (Validator.isEmpty(post)) {
    errors.push({ message: "post field is required" });
  }

  if (errors.length > 0) {
    res.send(errors);
  } else {
    models.Post.create({
      creatorId: creatorId,
      title: title,
      post: post,
      image: req.file.secure_url
    })
      .then(post => {
        if (!post) {
          res.status(400).send({ message: "error creating post" });
        } else {
          res.status(200).send({ success: true, data: post });
        }
      })
      .catch(error => {
        res.status(500).send("Error" + error);
      });
  }
});

//view single post with comments and likes
router.get("/post/:id", (req, res) => {
  models.Post.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: models.Comment
      },
      {
        model: models.Like
      }
    ]
  })
    .then(post => {
      if (!post) {
        res.status(400).send({ message: "post not found" });
      } else {
        res.status(200).send({ success: true, data: post });
      }
    })
    .catch(error => {
      res.status(500).send("Error" + error);
    });
});

module.exports = router;
