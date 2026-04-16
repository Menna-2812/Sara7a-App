import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  localFileUpload,
  fileTypeValidation,
} from "../../Utils/multer/local.multer.js";
import { fileValidation } from "../../Middleware/fileValidation.middleware.js";
import { validation } from "../../Middleware/validation.middleware.js";
import  * as userValidation from "./user.validation.js";

const router = Router();

router.get(
  "/",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  userService.getProfile,
);

router.patch(
  "/update-profile-pic",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.User] }),
  localFileUpload({
    customPath: "User/profile",
    validation: fileTypeValidation.images,
  }).single("attachment"),
  fileValidation,
  validation(userValidation.updateProfilePicSchema),
  userService.uploadProfilePic,
);

router.patch(
  "/update-cover-pic",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.User] }),
  localFileUpload({
    customPath: "User/cover",
    validation: fileTypeValidation.images,
  }).array("attachments", 5),
  fileValidation,
  validation(userValidation.updateCoverPicSchema),
  userService.uploadCoverPic,
);

router.patch(
  "/update-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

router.delete(
  "{/:userId}/freeze-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  validation(userValidation.freezeAccountSchema),
  userService.freezeAccount,
);

router.patch(
  "{/:userId}/restore-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin] }),
  validation(userValidation.restoreAccountSchema),
  userService.restoreAccount,
);

router.delete(
  "{/:userId}/hard-delete",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin] }),
  validation(userValidation.hardDeleteSchema),
  userService.hardDelete,
);

router.get(
  "/share-profile",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  userService.shareProfileLink
);

export default router;
