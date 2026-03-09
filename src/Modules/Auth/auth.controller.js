import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middleware/validation.middleware.js";
import * as authValidation from "./auth.validation.js";
import { localFileUpload } from "../../Utils/multer/local.multer.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signUp,
);

router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login,
);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken,
);

router.post("/social-login", authService.loginWithGoogle);

export default router;
