import { decrypt } from "../../Utils/security/encryption.security.js";
import * as dbService from "../../DB/database.repository.js"
import { successResponse } from './../../Utils/responnse/success.response.js';
import UserModel from './../../DB/Models/user.model.js';
import { vreifyToken } from "../../Utils/tokens/token.js";

export const getProfile = async (req, res) => {
    const { authorization } = req.headers;

    // verify token
    const decoded = vreifyToken({ token: authorization });

    const user = await dbService.findById({
        model: UserModel,
        id: decoded.id
    });
    if (user) {
        user.phone = await decrypt(user.phone);
    }

    return successResponse({
        res,
        message: "Successs To Get User Profile",
        data: { user },
        statusCode: 200
    });
}