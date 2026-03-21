import express from "express";
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  logoutAll,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  authRateLimiter,
  loginRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authRateLimiter, register);
authRouter.post("/login", loginRateLimiter, login);
authRouter.get("/me", protect, getMe);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", protect, logout);
authRouter.post("/logout-all", protect, logoutAll);
authRouter.post("/verify-email", authRateLimiter, verifyEmail);
authRouter.post("/forgot-password", authRateLimiter, forgotPassword);
authRouter.post("/reset-password", authRateLimiter, resetPassword);

export default authRouter;