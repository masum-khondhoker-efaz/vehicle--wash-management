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
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const addBookingIntoDB = (userId, bookingData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const createdBooking = yield prisma.bookings.create({
            data: {
                garageId: bookingData.garageId,
                customerId: userId,
                ownerNumber: bookingData.ownerNumber,
                carName: bookingData.carName,
                carId: bookingData.carId,
                location: bookingData.location,
                latitude: bookingData.latitude,
                longitude: bookingData.longitude,
                serviceStatus: client_1.ServiceStatus.IN_ROUTE,
                bookingTime: bookingData.bookingTime,
                bookingStatus: client_1.BookingStatus.PENDING,
                totalAmount: bookingData.totalAmount,
                serviceIds: bookingData.serviceIds,
                paymentStatus: client_1.PaymentStatus.PENDING,
            },
        });
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
            garageId: true,
            serviceDate: true,
            bookingTime: true,
            carId: true,
            bookingStatus: true,
            totalAmount: true,
            location: true,
            latitude: true,
            longitude: true,
            serviceStatus: true,
            serviceIds: true,
            estimatedTime: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    for (const booking of bookings) {
        const car = yield prisma_1.default.car.findUnique({
            where: {
                id: booking.carId,
            },
            select: {
                driverId: true,
            },
        });
        const driver = yield prisma_1.default.user.findUnique({
            where: {
                id: car === null || car === void 0 ? void 0 : car.driverId,
            },
            select: {
                fullName: true,
                profileImage: true,
            },
        });
        booking.driverName = driver === null || driver === void 0 ? void 0 : driver.fullName;
        booking.driverImage = driver === null || driver === void 0 ? void 0 : driver.profileImage;
        const services = yield prisma_1.default.service.findMany({
            where: {
                id: {
                    in: booking.serviceIds,
                },
            },
            select: {
                serviceName: true,
            },
        });
        booking.serviceNames = services.map(service => service.serviceName);
    }
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
            serviceIds: data.serviceIds,
            totalAmount: data.totalAmount,
            ownerNumber: data.ownerNumber,
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
