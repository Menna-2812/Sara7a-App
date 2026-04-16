import { successResponse } from "./../../Utils/responnse/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";
import {
  deleteOne,
  findById,
  findByIdAndUpdate,
  findOneAndUpdate,
  updateOne,
} from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
  BadRequestException,
  ForbiddenException,
} from "../../Utils/responnse/error.response.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";

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

export const uploadProfilePic = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded"));
  }
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { profilePic: req.file.finalPath },
  });
  return successResponse({
    res,
    message: "Successs To Update User Profile Picture",
    data: { user },
    statusCode: 200,
  });
};

export const uploadCoverPic = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return next(new Error("No files uploaded"));
  }

  const filesPaths = req.files.map((file) => file.finalPath);

  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: {
      $push: { coverPic: { $each: filesPaths } },
    },
  });

  return successResponse({
    res,
    message: "Success To Update User Cover Pictures",
    data: { user },
    statusCode: 200,
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await findById({
    model: UserModel,
    id: req.user._id,
  });
  const isValidPassword = await compareHash({
    plainText: oldPassword,
    cipherText: user.password,
    algo: HashEnum.Bcrypt,
  });
  if (!isValidPassword)
    throw BadRequestException({ message: "Invalid Password" });

  const hashedPassword = await generateHash({
    plainText: newPassword,
    algo: HashEnum.Bcrypt,
  });

  await updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    update: { password: hashedPassword },
  });
  return successResponse({
    res,
    message: "Success To Update Account Password",
    data: { user },
    statusCode: 200,
  });
};

export const freezeAccount = async (req, res) => {
  const { userId } = req.params;
  if (userId && req.user.role !== RoleEnum.Admin)
    throw ForbiddenException({
      message: "You are not Authorrized to do this Action",
    });
  const updatedUser = await findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId || req.user._id, freezedAt: { $exists: false } },
    update: {
      freezedAt: Date.now(),
      freezedBy: req.user._id,
      $unset: {
        restoredBy: true,
        restoredAt: true,
      },
    },
  });
  return successResponse({
    res,
    message: "Success To Freeze the account",
    data: { updatedUser },
    statusCode: 200,
  });
};

export const restoreAccount = async (req, res) => {
  const { userId } = req.params;
  const updatedUser = await findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      freezedAt: { $exists: true },
      freezedBy: { $ne: userId },
    },
    update: {
      restoredAt: Date.now(),
      restoredBy: req.user._id,
      $unset: {
        freezedBy: true,
        freezedAt: true,
      },
    },
  });
  return successResponse({
    res,
    message: "Success To Restore the account",
    data: { updatedUser },
    statusCode: 200,
  });
};

export const hardDelete = async (req, res) => {
  const { userId } = req.params;
  const user = await deleteOne({
    model: UserModel,
    filter: { _id: userId },

  });
  return user.deletedCount 
    ? successResponse({
        res,
        message: "Success To Delete the account",
        statusCode: 200,
      })
    : NotFoundException({ message: "User not found" });
};

export const shareProfileLink = async (req, res) => {

  const shareLink = `${req.protocol}://${req.get("host")}/users/profile/${req.user._id}`;

  return successResponse({
    res,
    message: "Success To Generate Share Profile Link",
    data: { shareLink },
    statusCode: 200,
  });
};