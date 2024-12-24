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
exports.couponService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const addCouponIntoDB = (userId, couponData) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield prisma_1.default.coupon.create({
        data: Object.assign({}, couponData),
    });
    if (!coupon) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Coupon not created');
    }
    return coupon;
});
const getCouponListFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const coupons = yield prisma_1.default.coupon.findMany();
    if (!coupons) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Coupons not found');
    }
    return coupons;
});
const getCouponByIdFromDB = (couponId) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield prisma_1.default.coupon.findUnique({
        where: {
            id: couponId,
        },
    });
    if (!coupon) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Coupon not found');
    }
    return coupon;
});
const updateCouponIntoDB = (userId, couponId, couponData) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield prisma_1.default.coupon.update({
        where: {
            id: couponId,
        },
        data: Object.assign({}, couponData),
    });
    if (!coupon) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Coupon not updated');
    }
    return coupon;
});
const deleteCouponFromDB = (couponId) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield prisma_1.default.coupon.delete({
        where: {
            id: couponId,
        },
    });
    if (!coupon) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Coupon not deleted');
    }
    return coupon;
});
const applyPromoCodeIntoDB = (userId, promoCode) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Check if the booking exists for the given user
    const service = yield prisma_1.default.service.findUnique({
        where: {
            id: promoCode.serviceId,
        },
    });
    if (!service) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service not found');
    }
    // Find the promo code
    const promo = yield prisma_1.default.coupon.findUnique({
        where: {
            id: promoCode.couponId,
            couponCode: promoCode.couponCode,
            expiryDate: {
                gte: new Date(),
            },
        },
    });
    // Check if the promo code exists
    if (!promo) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Promo code not found');
    }
    // Optional: Validate promo code expiry date
    const couponUsage = yield prisma_1.default.couponUsage.findFirst({
        where: {
            couponId: promo.id,
        },
    });
    if (couponUsage) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Promo code has already been used');
    }
    let servicePrice;
    // Update the booking with the discounted amount
    if (promoCode.serviceType === client_1.ServiceType.PREMIUM) {
        if (service.largeCarPrice !== null) {
            servicePrice =
                service.largeCarPrice -
                    (service.largeCarPrice * ((_a = promo.percentage) !== null && _a !== void 0 ? _a : 0)) / 100;
        }
        else {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service premium price is null');
        }
    }
    if (promoCode.serviceType === client_1.ServiceType.BASIC) {
        if (service.smallCarPrice !== null) {
            servicePrice =
                service.smallCarPrice -
                    (service.smallCarPrice * ((_b = promo.percentage) !== null && _b !== void 0 ? _b : 0)) / 100;
        }
        else {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service basic price is null');
        }
    }
    // Create a coupon usage entry
    // const couponUsed = await prisma.couponUsage.create({
    //   data: {
    //     couponId: promo.id,
    //     bookingId: bookingId,
    //     customerId: userId,
    //   },
    // });
    // if (!couponUsed) {
    //   throw new AppError(httpStatus.CONFLICT,'couponUsage is not created');
    // }
    return { Total_price: servicePrice };
});
exports.couponService = {
    addCouponIntoDB,
    getCouponListFromDB,
    getCouponByIdFromDB,
    updateCouponIntoDB,
    deleteCouponFromDB,
    applyPromoCodeIntoDB,
};
