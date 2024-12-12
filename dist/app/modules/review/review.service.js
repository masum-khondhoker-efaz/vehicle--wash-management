"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const addReviewIntoDB = (userId, reviewData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const createdReview = yield prisma.review.create({
            data: {
                rating: reviewData.rating,
                customerId: userId,
                garageId: reviewData.garageId,
            },
        });
        return createdReview;
    }));
    return transaction;
});
const getReviewListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const garages = yield prisma_1.default.garages.findMany({
        where: {
            userId: userId,
        },
    });
    const reviewStats = yield prisma_1.default.review.aggregate({
        _count: {
            id: true,
        },
        _avg: {
            rating: true,
        },
        where: {
            garageId: {
                in: garages.map(garage => garage.id),
            },
        },
    });
    const reviews = yield prisma_1.default.review.findMany({
        where: {
            garageId: {
                in: garages.map(garage => garage.id),
            },
        },
        select: {
            id: true,
            rating: true,
            customerId: true,
            garageId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return { reviewStats, reviews };
});
const getReviewByIdFromDB = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const garages = yield prisma_1.default.garages.findMany({
        where: {
            userId: userId,
        },
    });
    const review = yield prisma_1.default.review.findUnique({
        where: {
            id: reviewId,
            garageId: {
                in: garages.map(garage => garage.id),
            },
        },
    });
    return review;
});
const updateReviewIntoDB = (userId, reviewId, reviewData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(userId, reviewId, reviewData);
    const review = yield prisma_1.default.review.update({
        where: {
            id: reviewId,
            customerId: userId,
        },
        data: {
            rating: reviewData.rating,
        },
    });
    return review;
});
const deleteReviewFromDB = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.default.review.delete({
        where: {
            id: reviewId,
            customerId: userId,
        }
    });
    return review;
});
exports.reviewService = {
    addReviewIntoDB,
    getReviewListFromDB,
    getReviewByIdFromDB,
    updateReviewIntoDB,
    deleteReviewFromDB,
};
