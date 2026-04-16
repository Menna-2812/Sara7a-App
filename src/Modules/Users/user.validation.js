import joi from "joi";
import { generalFields } from "../../Middleware/validation.middleware.js";
import { fileTypeValidation } from "../../Utils/multer/local.multer.js";

export const updateProfilePicSchema = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("attachment").required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileTypeValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),
      path: generalFields.file.path.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};

export const updateCoverPicSchema = {
  files: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("attachments").required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileTypeValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),
      path: generalFields.file.path.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: joi.ref("newPassword"),
  }),
};

export const freezeAccountSchema = {
  body: joi.object({
   userId: generalFields.id,
  }),
};

export const restoreAccountSchema = {
  body: joi.object({
   userId: generalFields.id,
  }),
};

export const hardDeleteSchema = {
  body: joi.object({
   userId: generalFields.id,
  }),
};