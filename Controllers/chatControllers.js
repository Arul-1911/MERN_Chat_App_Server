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
  }).populate("users","-password").populate("latestMessage");
  isChat = await User.populate(isChat,{
   path:"latestMessage.sender",
   select:"userName pic email"
  });

  if(isChat.length > 0){
   res.send(isChat[0])
  } else {
   let chatData = {
      chatName:"sender",
      isGroupChat:false,
      users:[req.user._id, userId]
   }

   try {
      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password");

      res.status(200).send(fullChat)

   } catch (error) {
      return res.status(400).json({message:"unable to create chat"})
   }

  }

});

//FETCH CHATS FOR PARTICULAR USER
const fetchChats = asyncHandler(async(req,res) => {
   try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({upadedAt: -1})
        .then(async (results) => {
         results = await User.populate(results,{
            path:"latestMessage.select",
            select:"userName pic email"
         });

         res.status(200).send(results)
        })
   } catch (error) {
        return res.status(400).json({ message: "unable to retrive chat" });
   }
})

module.exports = {
   accessChat,
   fetchChats
}
