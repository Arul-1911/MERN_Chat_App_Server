const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel.js");
const genrerateToken = require("../Config/generateToken.js");

//REGISTERING NEW USER
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, pic } = req.body;

  //USER VALIDATION
  if (!userName || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  //USER EXISTS ALREADY
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ error: "Email already exists" });
  }

  //CREATING NEW USER
  const user = await User.create({
    userName,
    email,
    password,
    pic,
  });

  if (user) {
    return res.status(201).json({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      pic: user.pic,
      token: genrerateToken(user._id),
    });
  } else {
    return res.status(401).json({ error: "failed to create user" });
  }
});

//USER LOGIN
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      pic: user.pic,
      token: genrerateToken(user._id),
    });
  } else {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
});

//GET ALL USERS

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            userName: { $regex: req.query.search, $options: "i" },
          },
          {
            email: { $regex: req.query.search, $options: "i" },
          },
        ],
      }
    : null;

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users)
});

module.exports = { registerUser, authUser, allUsers };
