import joi from "joi";
import { generalFields } from "../../Middleware/validation.middleware.js";
import { genereateOTP } from "./../../Utils/genereateOTP.js";
import { generateHash } from "./../../Utils/security/hash.security.js";

export const signupSchema = {
  body: joi.object({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    age: generalFields.age,
    gender: generalFields.gender.required(),
    phone: generalFields.phone,
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
    role: generalFields.role,
    provider: generalFields.provider,
  }),
};

export const loginSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }),
};

export const resendOtpSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const forgetPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    newPassword: generalFields.password.required(),
    confirmNewPassword: joi.ref("newPassword")
  }),
};
