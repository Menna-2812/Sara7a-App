import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middleware/validation.middleware.js";
import * as authValidation from "./auth.validation.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signUp,
);

router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail,
);

router.post(
  "/resend-otp",
  validation(authValidation.resendOtpSchema),
  authService.resendOTP
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

// Logout with MongoDB 
router.post(
  "/logout",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logout,
);

// Logout with Redis
router.post(
  "/logout-with-redis",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logoutWithRedis,
);

router.patch(
  "/forget-password",
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword,
);

router.patch(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword,
);

export default router;
