"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const dotenv_1 = __importDefault(require("dotenv"));
const _1 = __importDefault(require("."));
dotenv_1.default.config();
// Google OAuth setup
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: _1.default.sosial_login.google.client_id,
    clientSecret: _1.default.sosial_login.google.client_secret,
    callbackURL: _1.default.sosial_login.google.redirect_uri,
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
}));
// Facebook OAuth setup
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: _1.default.sosial_login.facebook.client_id,
    clientSecret: _1.default.sosial_login.facebook.client_secret,
    callbackURL: _1.default.sosial_login.facebook.redirect_uri,
    profileFields: ["id", "displayName", "email", "photos"],
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
}));
// Serialize and deserialize user for session management
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((obj, done) => done(null, obj));
exports.default = passport_1.default;
