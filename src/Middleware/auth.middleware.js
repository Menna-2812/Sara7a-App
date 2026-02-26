import { findById } from "../DB/database.repository.js";
import UserModel from "../DB/Models/user.model.js";
import { TokenTypeEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../Utils/responnse/error.response.js";
import { getSignature, vreifyToken } from "../Utils/tokens/token.js";

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization.split(" ") || [];
  if (!Bearer || !token)
    throw BadRequestException({ message: "Invalid Token" });
  let signature = await getSignature({ signatureLevel: Bearer });
  const decoded = vreifyToken({
    token,
    secretKey:
      tokenType === TokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });
  const user = await findById({ model: UserModel, id: decoded.id });
  if (!user) throw NotFoundException({ message: "Not Registered Account" });
  return { user, decoded };
};

export const authentication = ({ tokenType = TokenTypeEnum.Access }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] }) => {
  return async (req, resizeBy, next) => {
    if (!accessRoles.includes(req.user.role))
      throw ForbiddenException({ message: "Unauthorized Access" });
    return next();
  };
};
