import express from "express";
import passport from "../../utils/passportSetup";
import { SocialLoginController } from "./socialLogin.controller";

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  SocialLoginController.googleCallback
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  SocialLoginController.facebookCallback
);

export const socialLoginRoutes = router;
