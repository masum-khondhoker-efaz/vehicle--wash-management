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
exports.bookingService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const addBookingIntoDB = (userId, bookingData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const createdBooking = yield prisma.bookings.create({
            data: {
                customerId: userId,
                ownerNumber: bookingData.ownerNumber,
                carName: bookingData.carName,
                location: bookingData.location,
                latitude: bookingData.latitude,
                longitude: bookingData.longitude,
                serviceStatus: client_1.ServiceStatus.IN_ROUTE,
                serviceType: bookingData.serviceType,
                serviceDate: bookingData.serviceDate,
                bookingTime: bookingData.bookingTime,
                bookingStatus: client_1.BookingStatus.PENDING,
                totalAmount: bookingData.totalAmount,
                serviceId: bookingData.serviceId,
                paymentStatus: client_1.PaymentStatus.PENDING,
                couponId: bookingData.couponId ? bookingData.couponId : null,
            },
        });
        if (!createdBooking) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Booking not created');
        }
        if (bookingData.couponId) {
            const couponUsed = yield prisma.couponUsage.create({
                data: {
                    couponId: bookingData.couponId,
                    bookingId: createdBooking.id,
                    customerId: userId,
                },
            });
            if (!couponUsed) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, 'couponUsage is not created');
            }
        }
        return createdBooking;
    }));
    return transaction;
});
const getBookingListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield prisma_1.default.bookings.findMany({
        where: {
            customerId: userId,
        },
    });
    return bookings;
});
const getBookingByIdFromDB = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield prisma_1.default.bookings.findMany({
        where: {
            id: bookingId,
            customerId: userId,
        },
        select: {
            id: true,
            serviceDate: true,
            bookingTime: true,
            bookingStatus: true,
            totalAmount: true,
            location: true,
            latitude: true,
            longitude: true,
            serviceStatus: true,
            serviceId: true,
            estimatedTime: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    const services = yield prisma_1.default.service.findFirst({
        where: {
            id: bookings[0].serviceId,
        },
        select: {
            serviceName: true,
        },
    });
    return bookings;
});
const updateBookingIntoDB = (userId, bookingId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedBooking = yield prisma_1.default.bookings.update({
        where: {
            id: bookingId,
            customerId: userId,
        },
        data: {
            bookingTime: data.bookingTime,
            totalAmount: data.totalAmount,
            ownerNumber: data.ownerNumber,
            carName: data.carName,
            location: data.location,
            latitude: data.latitude,
            longitude: data.longitude,
        },
    });
    return updatedBooking;
});
const cancelBookingIntoDB = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const cancelledBooking = yield prisma_1.default.bookings.update({
        where: {
            id: bookingId,
            customerId: userId,
        },
        data: {
            bookingStatus: client_1.BookingStatus.CANCELLED,
        },
    });
    return cancelledBooking;
});
const deleteBookingFromDB = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedBooking = yield prisma_1.default.bookings.delete({
        where: {
            id: bookingId,
            customerId: userId,
            bookingStatus: client_1.BookingStatus.CANCELLED,
        },
    });
    return deletedBooking;
});
exports.bookingService = {
    addBookingIntoDB,
    getBookingListFromDB,
    getBookingByIdFromDB,
    cancelBookingIntoDB,
    updateBookingIntoDB,
    deleteBookingFromDB,
};
