import { z } from 'zod';


const companyValidationSchema = z.object({
  
    latitude: z.number(),
    longitude: z.number(),
  
});

export const mapValidation = {
    companyValidationSchema,
};