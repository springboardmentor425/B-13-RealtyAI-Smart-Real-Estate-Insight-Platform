import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.models.js";
import sessionModel from "../models/session.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // 1. Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 2. Check if session exists and is not revoked
    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or revoked.",
      });
    }

    // 3. Check if user still exists
    const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Grant access
    req.user = currentUser;
    req.session = session;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token or session.",
    });
  }
};
