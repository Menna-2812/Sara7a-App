import { findById } from "../DB/database.repository.js";
import UserModel from "../DB/Models/user.model.js";
import { get, logoutAllKey, revokeTokenKey } from "../DB/redis.service.js";
import { SignatureEnum, TokenTypeEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorrizedException,
} from "../Utils/responnse/error.response.js";
import { getSignature, vreifyToken } from "../Utils/tokens/token.js";

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization?.split(" ") || [];
  if (!Bearer || !token)
    throw BadRequestException({ message: "Invalid Token" });
  let decoded;

  try {
    // try admin signature
    const signature = await getSignature({
      signatureLevel: SignatureEnum.Admin,
    });

    decoded = vreifyToken({
      token,
      secretKey:
        tokenType === TokenTypeEnum.Access
          ? signature.accessSignature
          : signature.refreshSignature,
    });
  } catch (error) {
    // if failed try user signature
    const signature = await getSignature({
      signatureLevel: SignatureEnum.User,
    });

    decoded = vreifyToken({
      token,
      secretKey:
        tokenType === TokenTypeEnum.Access
          ? signature.accessSignature
          : signature.refreshSignature,
    });
  }

  // Check if token is Revoked with Redis
  const isRevoked = await get({
    key: revokeTokenKey({ userId: decoded.id, jti: decoded.jti }),
  });
  if (isRevoked) throw UnauthorrizedException({ message: "Token is Revoked" });

  const user = await findById({ model: UserModel, id: decoded.id });
  if (!user) throw NotFoundException({ message: "Not Registered Account" });

  if (
    user.changeCredentialsTime &&
    user.changeCredentialsTime.getTime() > decoded.iat * 1000
  )
    throw UnauthorrizedException({ message: "Token is Expired" });

  // Check logout from all devices using Redis
  const logoutAllTime = await get({
    key: logoutAllKey({ userId: decoded.id }),
  });

  if (logoutAllTime && decoded.iat * 1000 < logoutAllTime)
    throw UnauthorrizedException({ message: "Token is Expired" });

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
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role))
      throw ForbiddenException({ message: "Unauthorized Access" });
    return next();
  };
};
