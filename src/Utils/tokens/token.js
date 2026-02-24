import jwt from "jsonwebtoken";
import { ACCESS_EXPIRES_DURATION, TOKEN_ACCESS_KEY } from "../../../config/config.service.js";


export const generateToken = ({
    payload,
    secretKey = TOKEN_ACCESS_KEY,
    options = { expiresIn: ACCESS_EXPIRES_DURATION }
}) => {
    return jwt.sign(payload, secretKey, options)
};

export const vreifyToken = ({
    token,
    secretKey = TOKEN_ACCESS_KEY,
}) => {
    return jwt.verify(token, secretKey);
};
