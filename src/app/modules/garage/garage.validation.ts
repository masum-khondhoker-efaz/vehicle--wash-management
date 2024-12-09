import { z } from 'zod';


const garageValidationSchema = z.object({
    garageName: z.string().min(1, 'Garage name is required'),
    garageImage: z.string().min(1, 'Garage image is required'),
    description: z.string().min(1, 'Description is required'),
    location: z.string().min(1, 'Location is required'),
    latitude: z.string(),
    longitude: z.string(),
    availableSlots: z.array(z.string()).nonempty('Available slots are required'),
    services: z.array(z.string()).nonempty('Services are required')
});

export const validateGarage = {
    garageValidationSchema
};