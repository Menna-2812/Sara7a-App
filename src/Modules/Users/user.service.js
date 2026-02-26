import { successResponse } from "./../../Utils/responnse/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";

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
