"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGarage = void 0;
const zod_1 = require("zod");
const garageValidationSchema = zod_1.z.object({
    garageName: zod_1.z.string().min(1, 'Garage name is required'),
    garageImage: zod_1.z.string().min(1, 'Garage image is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    location: zod_1.z.string().min(1, 'Location is required'),
    latitude: zod_1.z.string(),
    longitude: zod_1.z.string(),
    availableSlots: zod_1.z.array(zod_1.z.string()).nonempty('Available slots are required'),
    services: zod_1.z.array(zod_1.z.string()).nonempty('Services are required')
});
exports.validateGarage = {
    garageValidationSchema
};
