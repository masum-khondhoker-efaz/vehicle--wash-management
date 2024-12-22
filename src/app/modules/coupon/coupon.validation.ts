import { z } from 'zod';

const couponValidationSchema = z.object({
  body: z.object({
    couponCode: z.string().nonempty('Coupon code is required'),
    percentage: z
      .number()
      .int()
      .min(0)
      .max(100, 'Percentage must be between 0 and 100'),
    discount: z.number().optional(),
    firstTimeUser: z.boolean().optional(),
    expiryDate: z.string().optional(),
  }),
});

const updateCouponValidationSchema = z.object({
    body: z.object({
    couponCode: z.string().nonempty("Coupon code is required").optional(),
    percentage: z.number().int().min(0).max(100, "Percentage must be between 0 and 100").optional(),
    discount: z.number().optional(),
    firstTimeUser: z.boolean().optional(),
    expiryDate: z.string().optional(),
})
});

const applyPromoCodeSchema = z.object({
  body: z.object({
    couponCode: z.string(),
    serviceId: z.string(),
    serviceType: z.string(),
    couponId: z.string(),
  }),
});



export const couponValidation ={
    couponValidationSchema,
    updateCouponValidationSchema,
    applyPromoCodeSchema,
};