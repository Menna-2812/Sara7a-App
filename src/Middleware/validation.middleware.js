import { BadRequestException } from "../Utils/responnse/error.response.js";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../Utils/enums/user.enum.js";
import joi from "joi";
import { Types } from "mongoose";

export const generalFields = {
  firstName: joi.string().alphanum().min(3).max(25).messages({
    "any.requried": "First name is required",
    "string.min": "min length is 3",
    "string.max": "max length is 25",
  }),
  lastName: joi.string().alphanum().min(3).max(25).messages({
    "any.requried": "Last name is required",
    "string.min": "min length is 3",
    "string.max": "max length is 25",
  }),
  email: joi
    .string()
    .email({
      minDomainSegments: 1,
      maxDomainSegments: 3,
      tlds: { allow: ["com", "net", "org"] },
    })
    .messages({
      "string.email": "Invalid Email",
      "any.required": "Email is Required",
    }),
  age: joi.number().positive().integer(),
  gender: joi.string().valid(...Object.values(GenderEnum)),
  phone: joi
    .string()
    .pattern(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/)
    .messages({ "string.pattern.base": "Invalid Phone Number" }),
  password: joi.string().messages({
    "any.required": "Passowrd is Required",
  }),
  confirmPassword: joi.ref("password"),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId Format")
    );
  }),
  role: joi.string().valid(...Object.values(RoleEnum)),
  provider: joi.string().valid(...Object.values(ProviderEnum)),
};
export const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];

    for (const key of Object.keys(schema)) {
      console.log(schema[key]);
      console.log(schema);
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });
      console.log(`Validation Results for ${key}:`, validationResults);
      if (validationResults.error) {
        validationError.push({ key, details: validationResults.error.details });
      }
      if (validationError.length) {
        throw BadRequestException(
          { message: "Validation Error" },
          validationError,
        );
      }
      return next();
    }
  };
};
