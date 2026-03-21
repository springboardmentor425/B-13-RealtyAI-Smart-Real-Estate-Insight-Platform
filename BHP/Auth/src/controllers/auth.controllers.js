import userModel from "../models/user.models.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { getOtpHtml, getResetPasswordHtml } from "../utils/utils.js";
import otpService from "../services/otp.service.js";

// ================= REGISTER =================
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyRegistered) {
      return res.status(409).json({
        success: false,
        message: "Username or email already registered",
      });
    }

    // Password hashing is handled by userModel pre-save hook
    const user = await userModel.create({
      username,
      email,
      password,
    });

    // Generate and send verification OTP
    const otp = await otpService.generateAndStoreOTP(user._id, email, "verify");
    const otpHtml = getOtpHtml(otp);
    await sendEmail(email, "Verify your email", otpHtml);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ================= LOGIN =================
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // tokens
    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000, // 15 minutes to match JWT
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ================= GET ME =================
export async function getMe(req, res) {
  // Now simpler because req.user is attached by 'protect' middleware
  res.status(200).json({
    success: true,
    user: {
      username: req.user.username,
      email: req.user.email,
      verified: req.user.verified,
    },
  });
}

// ================= REFRESH TOKEN =================
export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // check session
    const session = await sessionModel.findOne({
      user: decoded.id,
      refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    // new tokens (rotation)
    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // update session
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        sessionId: session._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
}

// ================= LOGOUT =================
export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({
      message: "Refresh token not found",
      success: false
    })
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // check session
  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if(!session){
    return res.status(401).json({
      message: "Invalid session",
      success: false
    })
  }

  //  
  session.revoked = true;
  await session.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  };
  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("accessToken", cookieOptions);

  res.status(201).json({
    message: "Logout successful",
    success: true
  })
}

// ================= LOGOUT ALL =================
export async function logoutAll(req, res) {

  const refreshToken = req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({
      message: "Refresh token not found",
      success: false
    })
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  await sessionModel.updateMany({
    user: decoded.id,
    revoked: false
  }, {
    revoked: true
  })

  res.clearCookie("refreshToken");

  res.status(201).json({
    message: "Logout all successful",
    success: true
  })
}

// ================= VERIFY EMAIL =================
export async function verifyEmail(req, res) {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "OTP and email are required",
      });
    }

    const result = await otpService.verifyOTP(email, otp, "verify");

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    const user = await userModel.findByIdAndUpdate(
      result.userId,
      { verified: true },
      { new: true }
    );

    // Clean up used OTP
    await otpService.deleteOTP(email, "verify");

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ================= FORGOT PASSWORD =================
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      // Security: Don't reveal if user exists? (Standard choice is to be vague, but user asked for check)
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate and store OTP of type 'reset'
    const otp = await otpService.generateAndStoreOTP(user._id, email, "reset");

    // Send reset email
    const otpHtml = getResetPasswordHtml(otp);
    await sendEmail(email, "Password Reset OTP", otpHtml);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ================= RESET PASSWORD =================
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const result = await otpService.verifyOTP(email, otp, "reset");

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    const user = await userModel.findById(result.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Update password (using .save() to trigger bcrypt hook)
    user.password = newPassword;
    user.verified = true; // Auto-verify if they can reset password
    await user.save();

    // Revoke all existing sessions for this user
    await sessionModel.updateMany(
      { user: user._id, revoked: false },
      { revoked: true }
    );

    // Clean up OTP
    await otpService.deleteOTP(email, "reset");

    res.status(200).json({
      success: true,
      message: "Password reset successful. All previous sessions revoked.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}