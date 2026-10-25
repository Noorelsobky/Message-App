const { Router } = require("express");

const messageController = require("../controllers/messageController");
const isAuthenticated = require("../middleware/authMiddleware");
const { handleMessageImage } = require("../middleware/uploadMiddleware");

const messageRouter = Router();

messageRouter.get(
  "/messages",
  isAuthenticated,
  messageController.getMessages
);

messageRouter.get(
  "/messages/:userId",
  isAuthenticated,
  messageController.getConversation
);



messageRouter.post(
  "/messages/:userId",
  isAuthenticated,
  handleMessageImage,
  messageController.postMessage
);

messageRouter.delete(
  "/messages/:userId/:messageId",
  isAuthenticated,
  messageController.deleteMessage
);

module.exports = messageRouter;