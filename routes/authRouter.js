const { Router } = require("express");
const authController = require("../controllers/authController");

const authRouter = Router();

authRouter.get("/sign-up", authController.getSignUp);
authRouter.post("/sign-up", authController.postSignUp);

authRouter.get("/log-in", authController.getLogIn);
authRouter.post("/log-in", authController.postLogIn);

authRouter.get("/log-out", authController.logOut);

module.exports = authRouter;