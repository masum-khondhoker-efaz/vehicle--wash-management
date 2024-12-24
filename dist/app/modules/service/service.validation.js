"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const serviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        serviceName: zod_1.z.string().min(1).max(255),
        smallCarPrice: zod_1.z.number(),
        largeCarPrice: zod_1.z.number().optional(),
        duration: zod_1.z.string().optional(),
        availableTimes: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
const updateServiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        serviceName: zod_1.z.string().min(1).max(255).optional(),
        smallCarPrice: zod_1.z.number().optional(),
        largeCarPrice: zod_1.z.number().optional(),
        duration: zod_1.z.string().optional(),
        ServiceStatus: zod_1.z.nativeEnum(client_1.ServiceActiveStatus).optional(),
    }),
});
exports.serviceValidation = {
    serviceSchema,
    updateServiceSchema,
};
