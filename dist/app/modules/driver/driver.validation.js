"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverValidation = void 0;
const zod_1 = require("zod");
const driverSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(1, 'Full name is required'),
        email: zod_1.z.string().email('Invalid email').min(1, 'Email is required'),
        phoneNumber: zod_1.z.string().min(1, 'Phone number is required'),
        address: zod_1.z.string().optional(),
        joinDate: zod_1.z.string().min(1, 'Join date is required'),
        isActive: zod_1.z.boolean().optional(),
    }),
});
const updateDriverSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(1, 'Full name is required').optional(),
        email: zod_1.z.string().email('Invalid email').min(1, 'Email is required').optional(),
        phoneNumber: zod_1.z.string().min(1, 'Phone number is required').optional(),
        address: zod_1.z.string().optional(),
        joinDate: zod_1.z.string().min(1, 'Join date is required').optional(),
    }),
});
exports.driverValidation = {
    driverSchema,
    updateDriverSchema,
};
