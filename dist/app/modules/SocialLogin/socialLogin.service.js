"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialLoginService = void 0;
const config_1 = __importDefault(require("../../../config"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const generateToken_1 = require("../../utils/generateToken");
const client_1 = require("@prisma/client");
// google login into db
const googleLoginIntoDb = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(user);
    const isUserExist = yield prisma_1.default.user.findFirst({
        where: {
            googleId: user.id,
        },
    });
    if (isUserExist) {
        const token = (0, generateToken_1.generateToken)({
            id: isUserExist.id,
            email: isUserExist.email,
            role: client_1.UserRoleEnum.CUSTOMER
        }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
        return { token };
    }
    if (!isUserExist) {
        const newUser = yield prisma_1.default.user.create({
            data: {
                googleId: user.id,
                fullName: user === null || user === void 0 ? void 0 : user.displayName,
                email: user.emails ? user.emails[0].value : '',
                profileImage: user.photos[0].value,
                phoneNumber: user === null || user === void 0 ? void 0 : user.phoneNumber,
                status: client_1.UserStatus.ACTIVE,
                dateOfBirth: user === null || user === void 0 ? void 0 : user.dateOfBirth,
            },
            select: {
                id: true,
                email: true,
                role: true,
                googleId: true,
                phoneNumber: true,
                fullName: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        yield prisma_1.default.customer.create({
            data: {
                userId: newUser.id,
            },
        });
        const token = (0, generateToken_1.generateToken)({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
        return { token };
    }
});
// facebook login into db
const facebookLoginIntoDb = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findFirst({
        where: {
            facebookId: user.id,
        },
    });
    console.log(user);
    if (isUserExist) {
        const token = (0, generateToken_1.generateToken)({
            id: isUserExist.id,
            email: isUserExist.email,
            role: isUserExist.role,
        }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
        return token;
    }
    if (!isUserExist) {
        const newUser = yield prisma_1.default.user.create({
            data: {
                facebookId: user.id,
                fullName: user === null || user === void 0 ? void 0 : user.displayName,
                email: user.emails ? user.emails[0].value : '',
                profileImage: user.photos[0].value,
                phoneNumber: user === null || user === void 0 ? void 0 : user.phoneNumber,
                status: client_1.UserStatus.ACTIVE,
                dateOfBirth: user === null || user === void 0 ? void 0 : user.dateOfBirth,
            },
            select: {
                id: true,
                email: true,
                role: true,
                facebookId: true,
                phoneNumber: true,
                fullName: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        yield prisma_1.default.customer.create({
            data: {
                userId: newUser.id,
            },
        });
        const token = (0, generateToken_1.generateToken)({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
        return { token };
    }
});
exports.SocialLoginService = {
    googleLoginIntoDb,
    facebookLoginIntoDb,
};
