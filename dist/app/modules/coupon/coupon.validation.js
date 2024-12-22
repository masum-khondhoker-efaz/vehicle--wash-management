"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponValidation = void 0;
const zod_1 = require("zod");
const couponValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        couponCode: zod_1.z.string().nonempty('Coupon code is required'),
        percentage: zod_1.z
            .number()
            .int()
            .min(0)
            .max(100, 'Percentage must be between 0 and 100'),
        discount: zod_1.z.number().optional(),
        firstTimeUser: zod_1.z.boolean().optional(),
        expiryDate: zod_1.z.string().optional(),
    }),
});
const updateCouponValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        couponCode: zod_1.z.string().nonempty("Coupon code is required").optional(),
        percentage: zod_1.z.number().int().min(0).max(100, "Percentage must be between 0 and 100").optional(),
        discount: zod_1.z.number().optional(),
        firstTimeUser: zod_1.z.boolean().optional(),
        expiryDate: zod_1.z.string().optional(),
    })
});
const applyPromoCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        couponCode: zod_1.z.string(),
        serviceId: zod_1.z.string(),
        serviceType: zod_1.z.string(),
        couponId: zod_1.z.string(),
    }),
});
exports.couponValidation = {
    couponValidationSchema,
    updateCouponValidationSchema,
    applyPromoCodeSchema,
};
