import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import {
  create,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "./../../DB/database.repository.js";
import UserModel from "./../../DB/Models/user.model.js";
import {
  BadRequestException,
  conflictException,
  NotFoundException,
} from "./../../Utils/responnse/error.response.js";
import { successResponse } from "./../../Utils/responnse/success.response.js";
import { encrypt } from "./../../Utils/security/encryption.security.js";
import { getNewLoginCredientials } from "../../Utils/tokens/token.js";
import { OAuth2Client } from "google-auth-library";
import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/user.enum.js";
import {
  ACCESS_EXPIRES_DURATION,
  CLIENT_ID,
} from "../../../config/config.service.js";
import TokenModel from "../../DB/Models/token.model.js";
import {
  logoutAllKey,
  revokeTokenKey,
  set,
  get,
  otpCooldownKey,
  otpResendKey,
  otpKey,
  del,
} from "../../DB/redis.service.js";
import { genereateOTP } from "../../Utils/genereateOTP.js";
import { emailEvent } from "../../Utils/events/email.events.js";

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  //Check is user already exist
  if (await findOne({ model: UserModel, filter: { email } })) {
    throw conflictException({ message: "User Already Exists" });
  }
  //Hash the Password
  const hashedPassword = await generateHash({
    plainText: password,
    algo: HashEnum.Bcrypt,
  });
  //Encrypt The Phone
  const encryptedPhone = await encrypt(phone);

  const otp = genereateOTP();

  const hashedOTP = await generateHash({
    plainText: JSON.stringify(otp),
    algo: HashEnum.Bcrypt,
  });

  const user = await create({
    model: UserModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        confirmEmailOTP: hashedOTP,
        confirmEmailOTPExpiresAt: Date.now() + 5 * 60 * 1000, // 5 min
      },
    ],
  });

  await set({
    key: otpKey({ email }),
    value: hashedOTP,
    ex: 300,
  });

  emailEvent.emit("confirmEmail", { to: email, otp });

  return successResponse({
    res,
    statusCode: 201,
    message: "User Added Successfully",
    data: { user },
  });
};

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user) {
    throw NotFoundException({ message: "User Not Found" });
  }

  if (user.confirmEmail) {
    throw BadRequestException({
      message: "Email already verified",
    });
  }

  const hashedOTP = await get({
    key: otpKey({ email }),
  });
  if (!hashedOTP) {
    throw BadRequestException({
      message: "OTP expired or not found",
    });
  }

  const isOTPValid = await compareHash({
    plainText: JSON.stringify(otp),
    cipherText: hashedOTP,
    algo: HashEnum.Bcrypt,
  });
  if (!isOTPValid) {
    throw BadRequestException({
      message: "Invalid OTP",
    });
  }

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmail: new Date(),
      otpResendCount: 0,
    },
  });

  await del({ key: otpKey({ email }) });
  await del({ key: otpResendKey({ email }) });
  await del({ key: otpCooldownKey({ email }) });

  return successResponse({
    res,
    statusCode: 200,
    message: "Email Confirmed Successfully",
  });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user) {
    throw NotFoundException({ message: "User Not Found" });
  }
  if (user.confirmEmail) {
    throw BadRequestException({
      message: "Email already verified",
    });
  }
  const cooldown = await get({
    key: otpCooldownKey({ email }),
  });

  if (cooldown) {
    throw BadRequestException({
      message: "Please wait 60 seconds before requesting another OTP",
    });
  }

  const resendCount = await get({
    key: otpResendKey({ email }),
  });

  if (resendCount && Number(resendCount) >= 3) {
    throw BadRequestException({
      message: "Max resend attempts reached",
    });
  }

  const otp = genereateOTP();

  const hashedOTP = await generateHash({
    plainText: JSON.stringify(otp),
    algo: HashEnum.Bcrypt,
  });

  await set({
    key: otpKey({ email }),
    value: hashedOTP,
    ttl: 300,
  });

  await set({
    key: otpResendKey({ email }),
    value: resendCount ? Number(resendCount) + 1 : 1,
    ttl: 600,
  });

  await set({
    key: otpCooldownKey({ email }),
    value: "true",
    ttl: 60,
  });

  emailEvent.emit("resendOTP", {
    to: email,
    otp,
  });

  return successResponse({
    res,
    message: "OTP resent successfully",
    data: {
      email,
      expiresIn: 300,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  // find user by email
  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      freezedAt: { $exists: false },
    },
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

// Logout with ttl of MongoDB
export const logout = async (req, res) => {
  const { flag } = req.body;

  let status = 200;
  switch (flag) {
    // Logout From one Device
    case LogoutTypeEnum.logout:
      await create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
      status = 201;
      break;
    // Logout From All
    case LogoutTypeEnum.logoutFromAll:
      await updateOne({
        model: UserModel,
        filter: { _id: req.user._id },
        update: {
          changeCredentialsTime: Date.now(),
        },
      });
      status: 200;
      break;
  }
  return successResponse({
    res,
    message: "Logout Successfully",
    statusCode: status,
  });
};

// Logout with Redis
export const logoutWithRedis = async (req, res) => {
  const { flag } = req.body;

  let status = 200;
  switch (flag) {
    // Logout From one Device
    case LogoutTypeEnum.logout:
      await set({
        key: revokeTokenKey({ userId: req.user._id, jti: req.decoded.jti }),
        value: req.decoded.jti,
        ttl: req.decoded.iat + ACCESS_EXPIRES_DURATION,
      });
      status = 201;
      break;
    // Logout From All
    case LogoutTypeEnum.logoutFromAll:
      await set({
        key: logoutAllKey({ userId: req.user._id, jti: req.decoded.jti }),
        value: Date.now(),
        ttl: ACCESS_EXPIRES_DURATION,
      });
      status: 200;
      break;
  }
  return successResponse({
    res,
    message: "Logout Successfully",
    statusCode: status,
  });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const otp = genereateOTP();
  const hashedOTP = await generateHash({
    plainText: JSON.stringify(otp),
    algo: HashEnum.Bcrypt,
  });
  const user = await findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
    },
    update: {
      forgetPasswordOTP: hashedOTP,
    },
  });
  if (!user) throw NotFoundException({ message: "User Not Found" });

  emailEvent.emit("forgetPassword", { to: email, otp });

  return successResponse({
    res,
    statusCode: 200,
    message: "Check Your Inbox",
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });
  if (!user) throw NotFoundException({ message: "User Not Found" });

  const isOTPValid = await compareHash({
    plainText: JSON.stringify(otp),
    cipherText: user.forgetPasswordOTP,
    algo: HashEnum.Bcrypt,
  });
  if (!isOTPValid) {
    throw BadRequestException({
      message: "Invalid OTP",
    });
  }

  const hashedPassword = await generateHash({
    plainText: newPassword,
    algo: HashEnum.Bcrypt,
  });

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: hashedPassword,
      $unset: { forgetPasswordOTP: true },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password Reset Successfully",
  });
};
