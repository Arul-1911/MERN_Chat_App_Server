const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel.js");
const User = require("../Models/userModel.js");

//SEND ONE TO ONE CHAT
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userid not found" });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "userName pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(fullChat);
    } catch (error) {
      return res.status(400).json({ message: "unable to create chat" });
    }
  }
});

//FETCH CHATS FOR PARTICULAR USER
  const fetchChats = asyncHandler(async (req, res) => {
    try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ upadedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.select",
            select: "userName pic email",
          });

          res.status(200).send(results);
        });
    } catch (error) {
      return res.status(400).json({ message: "unable to retrive chat" });
    }
  });

//GROUP CHAT ROUTE
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(404).send({ message: "pls fill all the fields" });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(404)
      .send({ message: "more than 2 users is required to create group chat" });
  }

  users.push(req.user); //PUSH THE LOGGEDIN USER TO GROUPCHAT;

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    return res.status(404).send({ message: "unable to retrieve group chat" });
  }
});

//RENAMING THE CHAT NAME
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  console.log(chatId);

  const updateChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updateChat) {
    return res
      .status(404)
      .send({ message: "error in renaming the group name" });
  } else {
    return res.json(updateChat);
  }
});

//ADDING  NEW USER TO GROUP
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return res
      .status(401)
      .json({ message: "unable to add new memeber to group" });
  } else {
    return res.status(200).send(added);
  }
});

//REMOVE FROM GROUP
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(401).send({ message: "unable to remove user" });
  } else {
    res.status(200).send(removed);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup
};
