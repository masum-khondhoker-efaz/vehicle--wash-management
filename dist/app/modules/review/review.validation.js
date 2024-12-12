"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidation = void 0;
const zod_1 = require("zod");
const ReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number().min(1).max(5),
        garageId: zod_1.z.string().optional(),
    }),
});
exports.reviewValidation = {
    ReviewSchema,
};
