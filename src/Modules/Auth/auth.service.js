import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { create, findOne, findById } from "./../../DB/database.repository.js";
import UserModel from "./../../DB/Models/user.model.js";
import {
  BadRequestException,
  conflictException,
  NotFoundException,
} from "./../../Utils/responnse/error.response.js";
import { successResponse } from "./../../Utils/responnse/success.response.js";
import { encrypt } from "./../../Utils/security/encryption.security.js";
import { generateToken, vreifyToken } from "../../Utils/tokens/token.js";
import { getNewLoginCredientials } from "../../Utils/tokens/token.js";

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
