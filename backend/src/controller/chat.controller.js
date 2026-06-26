const chatModel = require("../model/chat.model");
const messageModel = require("../model/message.model");

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  return res.status(201).json({
    message: "Chat created",
    chat: {
      id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function getChats(req,res) {
  

  const user = req.user;

  const chats = await chatModel.find({
    user:user._id
  })
  


  res.status(200).json({
    message:"Chat retrived successfully",
    chats:  chats.map(chat =>({
      _id:chat._id,
      title:chat.title,
      lastActivity:chat.lastActivity,
      user:chat.user
    }))
  })
}


async function getMessages(req, res) {
  const chatId = req.params.id;
  // Validate chatId
  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required" });
  }
  const mongoose = require('mongoose');
  if (!mongoose.isValidObjectId(chatId)) {
    return res.status(400).json({ message: "Invalid Chat ID" });
  }
  try {
    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
    return res.status(200).json({
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (err) {
    console.error("Error retrieving messages:", err);
    return res.status(500).json({ message: "Failed to retrieve messages" });
  }
}


async function deletChat(req,res){
    const chatId = req.params.id;
  
 try{
   await chatModel.findByIdAndDelete(chatId)

  return res.status(200).json({
    message:"Chat deleted successfully"
  })
 }
 catch(e){
   return res.status(400).json({
    message:"Got some error"
   })
 }

}

module.exports = {
  createChat,
  getChats,
  getMessages,
  deletChat
};  
