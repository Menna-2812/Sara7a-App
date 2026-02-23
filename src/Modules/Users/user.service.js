import { decrypt } from "../../Utils/security/encryption.security.js";
import * as dbService from "../../DB/database.repository.js"
import { successResponse } from './../../Utils/responnse/success.response.js';
import UserModel from './../../DB/Models/user.model.js';

export const getProfile = async (req, res) => {
    const { id } = req.params;

    const user = await dbService.findById({
        model: UserModel,
        id: id
    });
    if(user){
        user.phone = await decrypt(user.phone);
    }

    return successResponse({
        res,
        message: "Successs To Get User Profile",
        data: { user },
        statusCode: 200
    });
}