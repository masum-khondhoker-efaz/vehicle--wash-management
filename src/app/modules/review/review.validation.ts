import { z } from 'zod';

const ReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    garageId: z.string().optional(),
  }),
});

export const reviewValidation = {
  ReviewSchema,
};
