//External Modules
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Local Modules
const router = express.Router();
const User = require("../models/user");

//Handelling signup request

router.post("/signup", async (req, res) => {
  try {
    // If the user already exists

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.send({ message: "User already exists" });
    }

    // If the user does not exist, create a new user

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).send({ message: "User created successfully" ,
      success: true
    });
  } catch (err) {
    
    res.send({ message: "Internal Server Error" });
  }
});

//Handelling login request

router.post("/login", async (req, res) => {
  try {
    //If the user not exists

    const user = await User.findOne({ email: req.body.email }).select("+password");

    if (!user) {
      return res.send({
        message: "User does not exist",
        success: false,
      });
    }

    //User exists, compare the password
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res.send({
        message: "Invalid password",
        success: false,
      });
    }

    //Password is valid, generate a token

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.send({
      message: "Login successful",
      success: true,
      token: token,
    });
  } catch (err) {
    
    return res.send({ message: "Internal Server Error" });
  }
});

module.exports = router;
