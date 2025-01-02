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
const notification_services_1 = require("../notification/notification.services");
const distance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};
const estimateTime = (distance, speed = 40) => {
    // speed is in km/h, default is 40 km/h
    const time = distance / speed; // time in hours
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return { hours, minutes };
};
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
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Booking is not created');
        }
        if (bookingData.couponCode) {
            const couponUsed = yield prisma.couponUsage.create({
                data: {
                    couponCode: bookingData.couponCode,
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
    const booking = yield prisma_1.default.bookings.findUnique({
        where: {
            id: bookingId,
            customerId: userId
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
            paymentStatus: true,
            createdAt: true,
            updatedAt: true,
            customerId: true,
            driverId: true,
            service: {
                select: {
                    serviceName: true,
                    serviceImage: true,
                    duration: true,
                    smallCarPrice: true,
                    largeCarPrice: true,
                },
            },
            driver: {
                select: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            profileImage: true,
                        },
                    },
                },
            },
        }
    });
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    const driverLocation = yield prisma_1.default.driver.findUnique({
        where: {
            userId: booking.driverId ? booking.driverId : '',
        },
        select: {
            latitude: true,
            longitude: true,
        },
    });
    if (!driverLocation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Driver not found');
    }
    if (booking.latitude !== null && booking.longitude !== null) {
        const dist = distance(driverLocation.latitude ? driverLocation.latitude : 0, driverLocation.longitude ? driverLocation.longitude : 0, booking.latitude, booking.longitude);
        const time = estimateTime(dist);
        return Object.assign(Object.assign({}, booking), { distance: `${dist.toFixed(2)} km`, time });
    }
});
const getBookingByIdFromDB2 = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.bookings.findUnique({
        where: {
            id: bookingId
        }
    });
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    return booking;
});
const getBookingListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pendingBookings = yield prisma_1.default.bookings.findMany({
        where: {
            customerId: userId,
            bookingStatus: { in: [client_1.BookingStatus.IN_PROGRESS, client_1.BookingStatus.IN_ROUTE, client_1.BookingStatus.PENDING] },
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
            driver: {
                select: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            profileImage: true,
                        },
                    },
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
            driver: {
                select: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            profileImage: true,
                        },
                    },
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
        data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.bookingTime && { bookingTime: data.bookingTime })), (data.totalAmount && { totalAmount: data.totalAmount })), (data.ownerNumber && { ownerNumber: data.ownerNumber })), (data.carName && { carName: data.carName })), (data.location && { location: data.location })), (data.latitude && { latitude: data.latitude })), (data.longitude && { longitude: data.longitude })), (data.bookingStatus && { bookingStatus: data.bookingStatus })), (data.paymentStatus && { paymentStatus: data.paymentStatus })), (data.serviceStatus && { serviceStatus: data.serviceStatus })), (data.specificInstruction && Object.assign({ specificInstruction: data.specificInstruction }, (data.paymentStatus && { paymentStatus: data.paymentStatus })))),
    });
    if (data.paymentStatus) {
        if (updatedBooking.paymentStatus === data.paymentStatus) {
            const notification = {
                title: 'Booking confirmed successful',
                body: `Your booking is confirmed successfully in ${updatedBooking.location} at ${updatedBooking.bookingTime} on ${updatedBooking.serviceDate}.`,
            };
            // if (fcmToken?.fcmToken) {
            const sendNotification = yield notification_services_1.notificationServices.sendSingleNotification(userId, notification);
            if (!sendNotification) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to send notification');
            }
        }
        return updatedBooking;
    }
    const notification = {
        title: 'Booking updated successful',
        body: 'Your booking is updated successfully.',
    };
    // if (fcmToken?.fcmToken) {
    const sendNotification = yield notification_services_1.notificationServices.sendSingleNotification(userId, notification);
    if (!sendNotification) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to send notification');
    }
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
    const notification = {
        title: 'Booking cancel successful',
        body: 'Your booking is cancelled successfully.',
    };
    // if (fcmToken?.fcmToken) {
    const sendNotification = yield notification_services_1.notificationServices.sendSingleNotification(userId, notification);
    if (!sendNotification) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to send notification');
    }
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
    getBookingByIdFromDB2,
};
