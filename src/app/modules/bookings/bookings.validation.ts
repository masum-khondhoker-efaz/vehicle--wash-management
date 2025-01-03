import { BookingStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const bookingSchema = z.object({
  body: z.object({
    serviceId: z.string(),
    totalAmount: z.number(),
    ownerNumber: z.string(),
    carName: z.string(),
    serviceDate: z.string(),
    location: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    estimatedTime: z.string().optional(),
    bookingTime: z.string(),
    specificInstruction: z.string().optional(),
  }),
});

const updateBookingSchema = z.object({
  body: z.object({
    serviceIds: z.array(z.string()).optional(),
    totalAmount: z.number().optional(),
    ownerNumber: z.string().optional(),
    carName: z.string().optional(),
    serviceDate: z.string().optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    estimatedTime: z.string().optional(),
    bookingTime: z.string().optional(),
    bookingStatus: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  }),
});




export const bookingValidation = { 
    bookingSchema,
    updateBookingSchema,
    
};
