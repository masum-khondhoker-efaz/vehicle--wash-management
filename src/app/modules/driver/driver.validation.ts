import { z } from 'zod';

const driverSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    address: z.string().optional(),
    joinDate: z.string().min(1, 'Join date is required'),
    isActive: z.boolean().optional(),
  }),
});

const updateDriverSchema = z.object({
    body: z.object({
        fullName: z.string().min(1, 'Full name is required').optional(),
        email: z.string().email('Invalid email').min(1, 'Email is required').optional(),
        phoneNumber: z.string().min(1, 'Phone number is required').optional(),
        address: z.string().optional(),
        joinDate: z.string().min(1, 'Join date is required').optional(),
    }),
    });

export const driverValidation = {
     driverSchema,
     updateDriverSchema,
};