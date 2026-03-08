import { successResponse } from "./../../Utils/responnse/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";
import { findByIdAndUpdate } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";

export const getProfile = async (req, res) => {
  if (req.user) {
    req.user.phone = await decrypt(req.user.phone);
  }
  return successResponse({
    res,
    message: "Successs To Get User Profile",
    data: req.user,
    statusCode: 200,
  });
};

export const uploadProfilePic = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { profilePic: req.file.finalPath },
  });
  return successResponse({
    res,
    message: "Successs To Upload User Profile",
    data: { user },
    statusCode: 200,
  });
};
