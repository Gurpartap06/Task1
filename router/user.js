const authController = require("../controller/user");
const express = require("express");

const authRouter = express.Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.post("/refreshToken", authController.refreshToken);

module.exports = authRouter;