const prisma = require("../db");

const getMessages = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.user.id,
        },
      },
      select: {
        id: true,
        username: true,
        profilePicture:true
      },
    });

    res.render("messages", {
      users,
      currentUser: req.user,
    });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {

    const otherUserId = Number(req.params.userId);

    if (!Number.isInteger(otherUserId)) {
      return res.status(400).send("Invalid user ID.");
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user.id,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: req.user.id,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            username: true,
          },
        },
        receiver: {
          select: {
            username: true,
          },
        },
      },
    });

    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
      },
    });

    if (!otherUser) {
      return res.status(404).send("User not found");
    }

    res.render("conversation", {
      messages,
      otherUser,
      currentUser: req.user,
    });
  } catch (error) {
    next(error);
  }
};



const postMessage = async (req, res, next) => {
  try {
    const receiverId = Number(req.params.userId);
    const content = req.body.content?.trim() || "";
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!Number.isInteger(receiverId) || receiverId <= 0) {
      return res.status(400).json({ error: "Invalid recipient." });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ error: "You cannot message yourself." });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!content && !imagePath) {
      return res.status(400).json({
        error: "Write a message or select an image.",
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: "Message is too long." });
    }

    const message = await prisma.message.create({
      data: {
        ...(content ? { content } : {}),
        imagePath,
        sender: {
          connect: { id: req.user.id },
        },
        receiver: {
          connect: { id: receiverId },
        },
      },
      include: {
        sender: {
          select: { username: true },
        },
      },
    });

    // AJAX requests receive the new message as JSON.
    // Ordinary form submissions still work as before.
    if (req.accepts("json") && !req.accepts("html")) {
      return res.status(201).json({
        message: {
          id: message.id,
          content: message.content,
          imagePath: message.imagePath,
          createdAt: message.createdAt,
          senderId: message.senderId,
          sender: message.sender,
        },
      });
    }

    return res.redirect(`/messages/${receiverId}`);
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const messageId = Number(req.params.messageId);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return res.status(400).json({ error: "Invalid message ID." });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
      },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    // Security: only the sender may delete their message.
    if (message.senderId !== req.user.id) {
      return res.status(403).json({
        error: "You can only delete your own messages.",
      });
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return res.json({ success: true, messageId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  getConversation,
  postMessage,
  deleteMessage,
};