"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidation = void 0;
const zod_1 = require("zod");
const bookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        serviceId: zod_1.z.string(),
        totalAmount: zod_1.z.number(),
        ownerNumber: zod_1.z.string(),
        carName: zod_1.z.string(),
        serviceDate: zod_1.z.string(),
        location: zod_1.z.string(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
        estimatedTime: zod_1.z.string().optional(),
        bookingTime: zod_1.z.string(),
    }),
});
const updateBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        serviceIds: zod_1.z.array(zod_1.z.string()).optional(),
        totalAmount: zod_1.z.number().optional(),
        ownerNumber: zod_1.z.string().optional(),
        carName: zod_1.z.string().optional(),
        serviceDate: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
        estimatedTime: zod_1.z.string().optional(),
        bookingTime: zod_1.z.string().optional(),
    }),
});
exports.bookingValidation = {
    bookingSchema,
    updateBookingSchema,
};
