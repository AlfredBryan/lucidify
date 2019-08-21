const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const Validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

//get all users
router.get("/users", (req, res) => {
  models.User.findAll({})
    .then(users => {
      if (users.length < 1) {
        res.status(404).send({ message: "No users found" });
      } else {
        res.status(200).send({
          success: true,
          data: users
        });
      }
    })
    .catch(error => {
      res.status(500).send("Error" + error);
    });
});

//New user can signup
router.post("/user/signup", upload, (req, res) => {
  const errors = [];
  const { surname, first_name, email, password } = req.body;
  //Hash password
  const passwordHash = bcrypt.hashSync(password, 10);
  //form validation
  if (Validator.isEmpty(email)) {
    errors.push({ message: "email field is required" });
  }

  if (!Validator.isEmpty(email)) {
    if (!Validator.isEmail(email)) {
      errors.push({ message: "email is invalid" });
    }
  }

  if (Validator.isEmpty(surname)) {
    errors.push({ message: "surname field is required" });
  }
  if (Validator.isEmpty(first_name)) {
    errors.push({ message: "first name field is required" });
  }

  if (Validator.isEmpty(password)) {
    errors.push({ message: "password field is required" });
  }

  if (!Validator.isEmpty(password)) {
    if (
      !Validator.isLength(password, {
        min: 6,
        max: 20
      })
    ) {
      errors.push({ message: "password must be atleast 6 characters" });
    }
  }

  if (errors.length > 0) {
    res.send(errors);
  } else {
    // Check if user already exists
    models.User.findOne({ where: { email: email } })
      .then(user => {
        if (user) {
          res.status(400).send({ message: "user already exists" });
        } else {
          models.User.create({
            surname: surname,
            first_name: first_name,
            email: email,
            password: passwordHash,
            image: req.file.secure_url
          }).then(user => {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
              expiresIn: 360000
            });
            res
              .status(200)
              .cookie("token", token)
              .send({
                authorized: true,
                token: token,
                user: user
              });
          });
        }
      })
      .catch(error => {
        res.status(500).send("Error" + error);
      });
  }
});

//User can login
router.post("/user/login", (req, res) => {
  const errors = [];
  const { email, password } = req.body;

  if (Validator.isEmpty(email)) {
    errors.push({ message: "email field is required" });
  }
  if (!Validator.isEmpty(email)) {
    if (!Validator.isEmail(email)) {
      errors.push({ message: "email is invalid" });
    }
  }

  if (Validator.isEmpty(password)) {
    errors.push({ message: "email field is required" });
  }

  if (errors.length > 0) {
    res.send(errors);
  } else {
    models.User.findOne({ where: { email: email } })
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: "user does not exist" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
          return res.status(400).send({
            authorized: false,
            token: null,
            message: "Invalid password"
          });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: 360000
        });
        res
          .status(200)
          .cookie("token", token)
          .send({
            authorized: true,
            token: token,
            user: user
          });
      })
      .catch(error => {
        res.status(500).send("Error" + error);
      });
  }
});

//User can update profile
router.put("/user/update/:id", upload, (req, res) => {
  const errors = [];
  const { surname, first_name } = req.body;

  if (Validator.isEmpty(surname)) {
    errors.push({ message: "surname field is required" });
  }

  if (!Validator.isEmpty(surname)) {
    if (
      !Validator.isLength(surname, {
        min: 2,
        max: 15
      })
    ) {
      errors.push({ message: "surname must be between 2 to 15 characters" });
    }
  }

  if (Validator.isEmpty(first_name)) {
    errors.push({ message: "first name field is required" });
  }

  if (!Validator.isEmpty(first_name)) {
    if (
      !Validator.isLength(first_name, {
        min: 2,
        max: 15
      })
    ) {
      errors.push({ message: "first name must be between 2 to 15 characters" });
    }
  }

  if (Validator.isEmpty(address)) {
    errors.push({ message: "address field is required" });
  }

  if (!Validator.isEmpty(address)) {
    if (
      !Validator.isLength(address, {
        min: 5,
        max: 30
      })
    ) {
      errors.push({ message: "address must be between 5 and 30 characters" });
    }
  }

  if (errors.length > 0) {
    res.send(errors);
  } else {
    models.User.update(
      {
        surname: surname,
        first_name: first_name,
        address: address
        //image: req.file.secure_url
      },
      { where: { id: req.params.id } }
    )
      .then(user => {
        res.status(200).send(user);
      })
      .catch(error => {
        res.status(400).send("Error" + error);
      });
  }
});

//User can view profile
router.get("/user/:id", (req, res) => {
  models.User.findOne({ where: { id: req.params.id } })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "user not found" });
      }
      res.status(200).send({
        message: "success",
        user: user
      });
    })
    .catch(error => {
      res.status(500).send("Error" + error);
    });
});

module.exports = router;
