import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "./../../Utils/enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [, "First Name is Mandatory"],
      minLength: 3,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: [, "Last Name is Mandatory"],
      minLength: 3,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.System;
      },
    },
    age: Number,
    DOB: Date,
    phone: String,
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.User,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },
    confirmEmailOTP: String,
    confirmEmail: Date,
    profilePic: String,
    coverPic: [String],
    changeCredentialsTime: Date,
    otpResendCount: {
      type: Number,
      default: 0,
    },
    forgetPasswordOTP: String,
    freezedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    freezedAt: Date,
    restoredBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    restoredAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
