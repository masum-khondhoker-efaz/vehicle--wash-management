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
                serviceId: reviewData.serviceId,
            },
        });
        return createdReview;
    }));
    return transaction;
});
const getReviewListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewStats = yield prisma_1.default.review.aggregate({
        _count: {
            id: true,
        },
        _avg: {
            rating: true,
        },
    });
    const reviews = yield prisma_1.default.review.findMany({
        include: {
            service: true,
        },
    });
    return { reviewStats, reviews };
});
const getReviewByIdFromDB = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.default.review.findUnique({
        where: {
            id: reviewId,
        },
    });
    return review;
});
const updateReviewIntoDB = (userId, reviewId, reviewData) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.default.review.update({
        where: {
            id: reviewId,
            customerId: userId,
            serviceId: reviewData.serviceId,
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
        },
    });
    return review;
});
const deleteAllReviewFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield prisma_1.default.review.deleteMany({});
    return reviews;
});
exports.reviewService = {
    addReviewIntoDB,
    getReviewListFromDB,
    getReviewByIdFromDB,
    updateReviewIntoDB,
    deleteReviewFromDB,
    deleteAllReviewFromDB,
};
