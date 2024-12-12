"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapValidation = void 0;
const zod_1 = require("zod");
const companyValidationSchema = zod_1.z.object({
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
});
exports.mapValidation = {
    companyValidationSchema,
};
