import { hash, compare } from "bcrypt";
import * as argon2 from "argon2";
import { SALT } from "./../../../config/config.service.js";
import { HashEnum } from "./../enums/security.enum.js";

export const generateHash = async ({
  plainText,
  salt = SALT,
  algo = HashEnum.Bcrypt,
}) => {
  let hashResults = "";
  switch (algo) {
    case HashEnum.Bcrypt:
      hashResults = await hash(plainText, salt);
      break;
    case HashEnum.Argon:
      hashResults = await argon2.hash(plainText);
      break;
    default:
      hashResults = await hash(plainText, salt);
      break;
  }
  return hashResults;
};

export const compareHash = async ({
  plainText,
  cipherText,
  algo = HashEnum.Bcrypt,
}) => {
  let match = false;
  switch (algo) {
    case HashEnum.Bcrypt:
      match = await compare(plainText, cipherText);
      break;
    case HashEnum.Argon:
      match = await argon2.verify(cipherText, plainText);
      break;
    default:
      match = await compare(plainText, cipherText);
      break;
  }
  return match;
};
