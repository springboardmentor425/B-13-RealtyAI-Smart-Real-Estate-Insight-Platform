import crypto from "crypto";
import otpModel from "../models/otp.model.js";

class OTPService {
  /**
   * Generate, hash and store a new OTP
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @param {string} type - 'verify' or 'reset'
   * @returns {string} The plain OTP
   */
  async generateAndStoreOTP(userId, email, type) {
    // 1. Delete any existing OTP of the same type for this email
    await otpModel.deleteMany({ email, type });

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash the OTP
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // 4. Store in DB
    await otpModel.create({
      user: userId,
      email,
      otpHash,
      type,
    });

    return otp;
  }

  /**
   * Verify an OTP
   * @param {string} email - User email
   * @param {string} otp - Plain OTP from user
   * @param {string} type - 'verify' or 'reset'
   * @returns {object} { success: boolean, message: string, userId: string }
   */
  async verifyOTP(email, otp, type) {
    const otpHash = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    const otpDoc = await otpModel.findOne({ email, type });

    if (!otpDoc) {
      return { success: false, message: "OTP expired or not found" };
    }

    // Check attempts (Brute force protection)
    if (otpDoc.attempts >= 5) {
      await otpModel.deleteOne({ _id: otpDoc._id });
      return { success: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    // Check manual expiry (redundant due to TTL but safe)
    if (new Date() > otpDoc.expiresAt) {
      await otpModel.deleteOne({ _id: otpDoc._id });
      return { success: false, message: "OTP has expired" };
    }

    if (otpDoc.otpHash !== otpHash) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return { success: false, message: "Invalid OTP" };
    }

    return { success: true, userId: otpDoc.user };
  }

  /**
   * Delete OTP after successful use
   * @param {string} email 
   * @param {string} type 
   */
  async deleteOTP(email, type) {
    await otpModel.deleteMany({ email, type });
  }
}

export default new OTPService();
