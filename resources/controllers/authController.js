cloudinary = require("../lib/cloudinary");
const { generateToken } = require("../lib/generateToken");
const user = require("../models/user");
const bcrypt = require("bcryptjs");

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const checkUser = await user.findOne({ email });
  if (!checkUser) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  // Check if user has a password (email/password login)
  if (!checkUser.password) {
    return res.status(400).json({
      message:
        "Please login with Google. This account was created with Google.",
    });
  }

  const isCorrectPassword = await bcrypt.compare(password, checkUser.password);
  if (!isCorrectPassword) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  generateToken(checkUser._id, res);
  return res.status(201).json({
    _id: checkUser._id,
    fullname: checkUser.fullname,
    email: checkUser.email,
    profilePicture: checkUser.profilePicture,
  });
};

exports.postSignup = async (req, res) => {
  console.log(req.body);
  const { fullname, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  const checkUser = await user.findOne({ email });
  if (checkUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = new user({
    fullname,
    email,
    password: hashedPassword,
    loginSource: "chit-chat", // Set login source as email
  });
  if (newUser) {
    generateToken(newUser._id, res);
    await newUser.save();
    return res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      loginSource: newUser.loginSource,
    });
  } else {
    return res.status(500).json({ message: "Error creating user" });
  }
};

exports.postLogout = (req, res) => {
  res.cookie("token", "", {
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

exports.checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


