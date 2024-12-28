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
                latitude: bookingData.latitude ? bookingData.latitude : null,
                longitude: bookingData.longitude ? bookingData.longitude : null,
                specificInstruction: bookingData.specificInstruction ? bookingData.specificInstruction : null,
                serviceStatus: client_1.ServiceStatus.IN_PROGRESS,
                serviceType: bookingData.serviceType,
                serviceDate: new Date(bookingData.serviceDate),
                bookingTime: bookingData.bookingTime,
                bookingStatus: client_1.BookingStatus.PENDING,
                totalAmount: bookingData.totalAmount,
                serviceId: bookingData.serviceId,
                paymentStatus: client_1.PaymentStatus.PENDING,
                couponCode: bookingData.couponCode ? bookingData.couponCode : null,
            },
        });
        if (!createdBooking) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Booking not created');
        }
        if (bookingData.couponId) {
            const couponUsed = yield prisma.couponUsage.create({
                data: {
                    couponCode: bookingData.couponId,
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
// const getBookingListFromDB = async (userId: string) => {
//   const bookings = await prisma.bookings.findMany({
//     where: {
//       customerId: userId,
//     },
//   });
//   return bookings;
// };
const getBookingByIdFromDB = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield prisma_1.default.bookings.findMany({
        where: {
            id: bookingId,
            customerId: userId,
            paymentStatus: client_1.PaymentStatus.COMPLETED,
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
            specificInstruction: true,
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
const getBookingListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(userId);
    const pendingBookings = yield prisma_1.default.bookings.findMany({
        where: {
            customerId: userId,
            bookingStatus: { in: [client_1.BookingStatus.IN_PROGRESS, client_1.BookingStatus.IN_ROUTE] },
            paymentStatus: client_1.PaymentStatus.COMPLETED,
        },
        include: {
            service: {
                select: {
                    serviceName: true,
                    serviceImage: true,
                    duration: true,
                    smallCarPrice: true,
                    largeCarPrice: true,
                },
            },
        },
        orderBy: {
            serviceDate: 'desc',
        },
    });
    const completedBookings = yield prisma_1.default.bookings.findMany({
        where: {
            customerId: userId,
            bookingStatus: client_1.BookingStatus.COMPLETED,
            paymentStatus: client_1.PaymentStatus.COMPLETED,
        },
        include: {
            service: {
                select: {
                    serviceName: true,
                    serviceImage: true,
                    duration: true,
                    smallCarPrice: true,
                    largeCarPrice: true,
                },
            },
        },
        orderBy: {
            serviceDate: 'desc',
        },
    });
    const cancelledBookings = yield prisma_1.default.bookings.findMany({
        where: {
            customerId: userId,
            bookingStatus: client_1.BookingStatus.CANCELLED,
        },
        include: {
            service: {
                select: {
                    serviceName: true,
                    serviceImage: true,
                    duration: true,
                    smallCarPrice: true,
                    largeCarPrice: true,
                },
            },
        },
        orderBy: {
            serviceDate: 'desc',
        },
    });
    return {
        pendingBookings,
        completedBookings,
        cancelledBookings,
    };
});
const updateBookingIntoDB = (userId, bookingId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedBooking = yield prisma_1.default.bookings.update({
        where: {
            id: bookingId,
            customerId: userId,
        },
        data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.bookingTime && { bookingTime: data.bookingTime })), (data.totalAmount && { totalAmount: data.totalAmount })), (data.ownerNumber && { ownerNumber: data.ownerNumber })), (data.carName && { carName: data.carName })), (data.location && { location: data.location })), (data.latitude && { latitude: data.latitude })), (data.longitude && { longitude: data.longitude })), (data.bookingStatus && { bookingStatus: data.bookingStatus })), (data.paymentStatus && { paymentStatus: data.paymentStatus })), (data.serviceStatus && { serviceStatus: data.serviceStatus })), (data.specificInstruction && {
            specificInstruction: data.specificInstruction,
        })),
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
