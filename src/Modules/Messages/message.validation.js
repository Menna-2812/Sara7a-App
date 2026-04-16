import joi from "joi";
import { generalFields } from "../../Middleware/validation.middleware.js";

export const sendMessageSchema = {
    params: joi.object({
        receiverId: generalFields.id.required(),
    }),
    body: joi.object({
        content: joi.string().min(2).max(1000).required().messages({
            "string.min": "Message must be at least 2 characters",
            "string.max": "Message must be at most 1000 characters",
        }),
    }),
}

export const getMessageSchema = {   }