const { Router } = require("express");

const userController = require("../controllers/userController");
const isAuthenticated = require("../middleware/authMiddleware");
const handleUpload = require("../middleware/uploadMiddleware");

const userRouter = Router();

userRouter.get(
  "/profile",
  isAuthenticated,
  userController.getProfile
);

userRouter.get(
  "/profile/edit",
  isAuthenticated,
  userController.getEditProfile
);

userRouter.post(
  "/profile/edit",
  isAuthenticated,
  handleUpload,
  userController.postEditProfile
);

module.exports = userRouter;