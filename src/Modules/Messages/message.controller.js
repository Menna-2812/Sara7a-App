import { Router } from "express";
import * as messageValidation from "./message.validation.js";
import * as messageService from "./message.service.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  authentication,
  authorization,
} from "../../Middleware/auth.middleware.js";

const router = Router();

router.post(
  "/send-message/:receiverId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(messageValidation.sendMessageSchema),
  messageService.sendMessage,
);


router.get(
  "/get-message-admin{/:receiverId}",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin] }),
  messageService.getMessage
);

router.get(
  "/get-message",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.User] }),
  messageService.getMessage
);

export default router;
