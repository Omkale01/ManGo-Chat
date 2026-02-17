//External Modules
const express = require("express");

//Local Modules
const User = require("../models/user");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/get-logged-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId });
    res.send({
      message: "User fetched successfully",
      success: true,
      data: user,
    });
  } catch (err) {
    res.send({ message: err.message, success: false });
  }
});

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } });
    res.send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (err) {
    res.send({ message: err.message, success: false });
  }
});

module.exports = router;
