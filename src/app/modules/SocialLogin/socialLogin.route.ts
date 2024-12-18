import express from "express";
import passport from "../../../config/passportSetup";
import { SocialLoginController } from "./socialLogin.controller";

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  SocialLoginController.googleLogin
);

router.get(
  '/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email'],
  }),
);
router.get(
  "/api/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  SocialLoginController.facebookCallback
);

export const socialLoginRoutes = router;
