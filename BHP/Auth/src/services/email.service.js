import nodemailer from "nodemailer";
import config from "../config/config.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.GOOGLE_USER,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.GOOGLE_REFRESH_TOKEN,
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

/**
 * Function to send email with retry logic
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 * @param {number} retries - Internal retry counter
 */
export const sendEmail = async (to, subject, html, text = "", retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"Auth System" <${config.GOOGLE_USER}>`,
        to,
        subject,
        text: text || "Please use an HTML compatible email client to view this message.",
        html,
      });

      console.log(`Message sent (Attempt ${attempt}): %s`, info.messageId);
      return; // Success
    } catch (error) {
      console.error(`Error sending email (Attempt ${attempt}):`, error.message);
      if (attempt === retries) {
        throw new Error(`Failed to send email after ${retries} attempts`);
      }
      // Wait before retrying (exponential backoff or simple delay)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
};


