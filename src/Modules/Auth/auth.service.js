import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { create, findOne } from "./../../DB/database.repository.js";
import UserModel from "./../../DB/Models/user.model.js";
import {
  BadRequestException,
  NotFoundException,
} from "./../../Utils/responnse/error.response.js";
import { successResponse } from "./../../Utils/responnse/success.response.js";
import { encrypt } from "./../../Utils/security/encryption.security.js";
import { getNewLoginCredientials } from "../../Utils/tokens/token.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../Utils/enums/user.enum.js";
import { CLIENT_ID } from "../../../config/config.service.js";

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  //Check is user already exist
  if (await findOne({ model: UserModel, filter: { email } })) {
    throw conflictException({ message: "User Already Exists" });
  }
  //Hash the Password
  const hashPassword = await generateHash({
    plainText: password,
    algo: HashEnum.Bcrypt,
  });
  //Encrypt The Phone
  const encryptedPhone = await encrypt(phone);
  const user = await create({
    model: UserModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: hashPassword,
        phone: encryptedPhone,
      },
    ],
  });
  return successResponse({
    res,
    statusCode: 201,
    message: "User Added Successfully",
    data: { user },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  // find user by email
  const user = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user) {
    throw NotFoundException({ message: "User Not Found" });
  }
  // compare password
  const isPasswordValid = await compareHash({
    plainText: password,
    cipherText: user.password,
    algo: HashEnum.Bcrypt,
  });
  if (!isPasswordValid) {
    throw BadRequestException({
      message: "Invalid Email OR Password",
    });
  }
  const credientials = await getNewLoginCredientials(user);
  return successResponse({
    res,
    statusCode: 201,
    message: "Login Successfully",
    data: { credientials },
  });
};

//Refactor
export const refreshToken = async (req, res) => {
  const credientials = await getNewLoginCredientials(req.user);

  return successResponse({
    res,
    message: "Token Refresh Successfully",
    data: { credientials },
    statusCode: 200,
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  // Verify
  const { email, picture, given_name, family_name, email_verified } =
    await verifyGoogleAccount({ idToken });
  // Logic
  if (!email_verified)
    throw BadRequestException({ message: "Email Not Verfied" });
  const user = await findOne({ model: UserModel, filter: { email } });
  if (user) {
    if (user.provider === ProviderEnum.Google) {
      const credientials = await getNewLoginCredientials(user);
      return successResponse({
        res,
        message: "Login Successfully",
        data: { credientials },
        statusCode: 200,
      });
    }
  }
  // Create User
  const newUser = await create({
    model: UserModel,
    data: [
      {
        firstName: given_name,
        lastName: family_name,
        email: email,
        profilePic: picture,
        provider: ProviderEnum.Google,
      },
    ],
  });
  const credientials = await getNewLoginCredientials(newUser);
  return successResponse({
    res,
    message: "Login Successfully",
    data: { credientials },
    statusCode: 201,
  });
};
