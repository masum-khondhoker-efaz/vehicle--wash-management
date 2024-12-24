import { ServiceActiveStatus } from '@prisma/client';
import { z } from 'zod';

const serviceSchema = z.object({
  body: z.object({
    serviceName: z.string().min(1).max(255),
    smallCarPrice: z.number().optional(),
    largeCarPrice: z.number().optional(),
    duration: z.string().optional(),
    availableTimes: z.array(z.string()).optional(),
  }),
});

const updateServiceSchema = z.object({
  body: z.object({
    serviceName: z.string().min(1).max(255).optional(),
    smallCarPrice: z.number().optional(),
    largeCarPrice: z.number().optional(),
    duration: z.string().optional(),
    ServiceStatus: z.nativeEnum(ServiceActiveStatus).optional(),
  }),
});

export const serviceValidation = {
  serviceSchema,
  updateServiceSchema,
};