import { z } from 'zod';

const ReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    serviceId: z.string(),
    bookingId: z.string(),
  }),
});

export const reviewValidation = {
  ReviewSchema,
};
