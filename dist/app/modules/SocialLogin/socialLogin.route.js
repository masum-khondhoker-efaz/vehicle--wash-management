"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLoginRoutes = void 0;
const express_1 = __importDefault(require("express"));
const passportSetup_1 = __importDefault(require("../../utils/passportSetup"));
const socialLogin_controller_1 = require("./socialLogin.controller");
const router = express_1.default.Router();
router.get("/auth/google", passportSetup_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
router.get("/google/callback", passportSetup_1.default.authenticate("google", { failureRedirect: "/" }), socialLogin_controller_1.SocialLoginController.googleCallback);
router.get("/auth/facebook", passportSetup_1.default.authenticate("facebook", {
    scope: ["email", "public_profile"],
}));
router.get("/facebook/callback", passportSetup_1.default.authenticate("facebook", { failureRedirect: "/" }), socialLogin_controller_1.SocialLoginController.facebookCallback);
exports.socialLoginRoutes = router;
