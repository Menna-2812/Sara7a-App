import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";

export async function sendEmail({
  to = "",
  subject = "",
  text = "",
  html = "",
  cc = "",
  bcc = "",
  attachments = [],
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASSWORD,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: `"Sara7a App" <${USER_EMAIL}>`,
      to,
      subject,
      text,
      html,
      attachments,
      cc,
      bcc,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  welcome: "Welcome To Sara7a App",
  contactUs: "Contact Us",
  resendOTP: "Resend OTP"
};
