import { z } from 'zod';

const bookingSchema = z.object({
  body: z.object({
    serviceIds: z.array(z.string()),
    totalAmount: z.number(),
    ownerNumber: z.string(),
    carName: z.string(),
    serviceDate: z.string(),
    location: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    estimatedTime: z.string().optional(),
    bookingTime: z.string(),
  }),
});

export const bookingValidation = { 
    bookingSchema 
};
