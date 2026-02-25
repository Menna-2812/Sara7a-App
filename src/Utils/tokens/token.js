import jwt from "jsonwebtoken";
import {
    ACCESS_EXPIRES_DURATION,
    TOKEN_USER_ACCESS_KEY,
    TOKEN_ADMIN_ACCESS_KEY,
    TOKEN_ADMIN_REFRESH_KEY,
    TOKEN_USER_REFRESH_KEY,
    REFRESH_EXPIRES_DURATION
} from "../../../config/config.service.js";
import { SignatureEnum, RoleEnum } from "../enums/user.enum.js";

export const generateToken = ({
    payload,
    secretKey = TOKEN_USER_ACCESS_KEY,
    options = {}
}) => {
    return jwt.sign(payload, secretKey, {
        expiresIn: ACCESS_EXPIRES_DURATION,
        ...options
    });
};

export const vreifyToken = ({ token, secretKey = TOKEN_USER_ACCESS_KEY }) => {
    return jwt.verify(token, secretKey);
};

export const getSignature = ({ signatureLevel = SignatureEnum.User }) => {
    let signature = { accessSignature: undefined, refreshSignature: undefined };

    switch (signatureLevel) {
        case SignatureEnum.Admin:
            signature.accessSignature = TOKEN_ADMIN_ACCESS_KEY;
            signature.refreshSignature = TOKEN_ADMIN_REFRESH_KEY;
            break;
        case SignatureEnum.User:
            signature.accessSignature = TOKEN_USER_ACCESS_KEY;
            signature.refreshSignature = TOKEN_USER_REFRESH_KEY;
            break;
        default:
            signature.accessSignature = TOKEN_USER_ACCESS_KEY;
            signature.refreshSignature = TOKEN_USER_REFRESH_KEY;
            break;
    }
    return signature;
};

export const getNewLoginCredientials = async (user) => {
    const signature = await getSignature({
        signatureLevel: user.role != RoleEnum.Admin ? SignatureEnum.User : SignatureEnum.Admin,
    });

    const accessToken = generateToken({
        payload: { _id: user._id },
        secretKey: signature.accessSignature,
        options: { expiresIn: ACCESS_EXPIRES_DURATION }
    });

    const refreshToken = generateToken({
        payload: { _id: user._id },
        secretKey: signature.refreshSignature,
        options: { expiresIn: REFRESH_EXPIRES_DURATION }
    });

    return { accessToken, refreshToken };
};