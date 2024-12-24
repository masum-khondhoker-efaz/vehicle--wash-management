import { z } from 'zod';

const couponValidationSchema = z.object({
  body: z.object({
    couponCode: z.string().nonempty('Coupon code is required'),
    percentage: z
      .number()
      .int()
      .min(0)
      .max(100, 'Percentage must be between 0 and 100'),
      largeCarPrice: z.number().optional(),
      smallCarPrice: z.number().optional(),
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
    largeCarPrice: z.number().optional(),
    smallCarPrice: z.number().optional(),
  }),
});



export const couponValidation ={
    couponValidationSchema,
    updateCouponValidationSchema,
    applyPromoCodeSchema,
};