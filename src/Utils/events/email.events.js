import { EventEmitter } from "node:events";
import { template } from "./../email/generateHTML.js";
import { emailSubject, sendEmail } from "../../Utils/email/email.utils.js";

export const emailEvent = new EventEmitter();
emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp,emailSubject.confirmEmail),
  }).catch((error) => {
    console.log("Error Sending Confirm Email", error);
  });
});

emailEvent.on("resendOTP", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resendOTP,
    html: template(data.otp, emailSubject.resendOTP),
  }).catch((error) => {
    console.log("Error Resending Confirm Email", error);
  });
});

emailEvent.on("forgetPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, emailSubject.resetPassword),
  }).catch((error) => {
    console.log("Error Sending Reset Password Email", error);
  });
});
