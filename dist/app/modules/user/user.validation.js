"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = __importDefault(require("zod"));
const registerUser = zod_1.default.object({
    body: zod_1.default.object({
        fullName: zod_1.default.string({
            required_error: 'Name is required!',
        }).optional(),
        email: zod_1.default
            .string({
            required_error: 'Email is required!',
        })
            .email({
            message: 'Invalid email format!',
        }).optional(),
        password: zod_1.default.string({
            required_error: 'Password is required!',
        }).optional(),
        phoneNumber: zod_1.default.string({
            required_error: 'Phone number is required!',
        }).optional(),
    }),
});
const updateProfileSchema = zod_1.default.object({
    body: zod_1.default.object({
        fullName: zod_1.default
            .string({
            required_error: 'Name is required!',
        })
            .optional(),
        gender: zod_1.default
            .string({
            required_error: 'Password is required!',
        })
            .optional(),
        phoneNumber: zod_1.default
            .string({
            required_error: 'Phone number is required!',
        })
            .optional(),
    }),
    dateOfBirth: zod_1.default
        .string({
        required_error: 'Date of birth is required!',
    })
        .optional(),
});
const forgetPasswordSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default
            .string({
            required_error: 'Email is required!',
        })
            .email({
            message: 'Invalid email format!',
        }),
    }),
});
const verifyOtpSchema = zod_1.default.object({
    body: zod_1.default.object({
        otp: zod_1.default.number({
            required_error: 'OTP is required!',
        }),
    }),
});
const changePasswordSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default
            .string({
            required_error: 'Email is required!',
        })
            .email({
            message: 'Invalid email format!',
        }),
        newPassword: zod_1.default.string({
            required_error: 'Password is required!',
        }),
    }),
});
const socialLoginSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default
            .string({
            required_error: 'Email is required!',
        })
            .email({
            message: 'Invalid email format!',
        }).optional(),
        fullName: zod_1.default.string({
            required_error: 'Name is required!',
        }),
        fcmToken: zod_1.default.string({
            required_error: 'Fcm token is required!',
        }),
        role: zod_1.default.string({
            required_error: 'Role is required!',
        }),
    }),
});
exports.UserValidations = {
    registerUser,
    updateProfileSchema,
    forgetPasswordSchema,
    verifyOtpSchema,
    changePasswordSchema,
    socialLoginSchema,
};
