"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.driverService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
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
const addDriverIntoDB = (userId, driverData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, driverImage } = driverData;
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Create the driver
        const createdDriver = yield prisma.user.create({
            data: {
                fullName: data.fullName,
                profileImage: driverImage,
                email: data.email,
                password: yield bcrypt.hash(data.password, 12),
                phoneNumber: data.phoneNumber,
                role: client_1.UserRoleEnum.DRIVER,
            },
        });
        yield prisma.driver.create({
            data: {
                userId: createdDriver.id,
                address: data.address,
                joinDate: data.joinDate,
                adminId: userId,
            },
        });
        return createdDriver;
    }));
    return transaction;
});
const getDriverListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const drivers = yield prisma_1.default.driver.findMany({
        select: {
            userId: true,
            address: true,
            joinDate: true,
            user: {
                select: {
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
        },
    });
    return drivers;
});
const getDriverByIdFromDB = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield prisma_1.default.driver.findUnique({
        where: {
            userId: driverId,
        },
        select: {
            userId: true,
            address: true,
            joinDate: true,
            user: {
                select: {
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
        },
    });
    return driver;
});
const updateDriverIntoDB = (userId, driverId, driverData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Update the driver
        const updatedDriver = yield prisma.user.update({
            where: {
                id: driverId,
            },
            data: {
                fullName: driverData.fullName,
                profileImage: driverData.driverImage,
                email: driverData.email,
                phoneNumber: driverData.phoneNumber,
            },
        });
        const updateData = yield prisma.driver.update({
            where: {
                userId: driverId,
            },
            data: {
                address: driverData.address,
                joinDate: driverData.joinDate,
            },
            select: {
                userId: true,
                address: true,
                joinDate: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });
        return updateData;
    }));
    return transaction;
});
const deleteDriverFromDB = (userId, driverId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(driverId, userId);
        const deletedDriver = yield prisma.driver.delete({
            where: {
                userId: driverId,
            },
        });
        yield prisma.user.delete({
            where: {
                id: driverId,
            },
        });
        return deletedDriver;
    }));
    return transaction;
});
const getBookingsFromDB = (userId, latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    const pendingBookings = yield prisma_1.default.bookings.findMany({
        where: {
            driverId: userId,
            bookingStatus: client_1.BookingStatus.IN_PROGRESS,
        },
        select: {
            id: true,
            bookingTime: true,
            bookingStatus: true,
            customerId: true,
            serviceStatus: true,
            serviceType: true,
            serviceId: true,
            carName: true,
            ownerNumber: true,
            location: true,
            latitude: true,
            longitude: true,
            totalAmount: true,
            paymentStatus: true,
            driverId: true,
            service: {
                select: {
                    serviceName: true,
                    serviceImage: true,
                    duration: true,
                },
            },
        },
    });
    const completedBookings = yield prisma_1.default.bookings.findMany({
        where: {
            driverId: userId,
            bookingStatus: client_1.BookingStatus.COMPLETED,
        },
        select: {
            id: true,
            bookingTime: true,
            customerId: true,
            bookingStatus: true,
            serviceStatus: true,
            serviceType: true,
            serviceId: true,
            carName: true,
            ownerNumber: true,
            location: true,
            totalAmount: true,
            paymentStatus: true,
            driverId: true,
            service: {
                select: {
                    serviceName: true,
                    serviceImage: true,
                    duration: true,
                },
            },
        },
    });
    const pendingBookingsWithDistance = pendingBookings.map(booking => {
        if (booking.latitude !== null && booking.longitude !== null) {
            const dist = distance(latitude, longitude, booking.latitude, booking.longitude);
            const time = estimateTime(dist);
            return Object.assign(Object.assign({}, booking), { distance: `${dist.toFixed(2)} km`, time });
        }
        return Object.assign(Object.assign({}, booking), { distance: null });
    });
    return {
        pendingBookings: pendingBookingsWithDistance,
        completedBookings,
    };
});
const getBookingByIdFromDB = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.bookings.findUnique({
        where: {
            driverId: userId,
            id: bookingId,
        },
        select: {
            id: true,
            bookingTime: true,
            bookingStatus: true,
            serviceStatus: true,
            serviceType: true,
            serviceId: true,
            specificInstruction: true,
            carName: true,
            ownerNumber: true,
            location: true,
            latitude: true,
            longitude: true,
            totalAmount: true,
            paymentStatus: true,
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
    });
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    const driverLocation = yield prisma_1.default.driver.findFirst({
        where: {
            userId: userId,
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
const updateOnlineStatusIntoDB = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(data);
    const updatedDriver = yield prisma_1.default.driver.update({
        where: {
            userId: userId,
        },
        data: {
            inOnline: data.inOnline,
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
        },
    });
    return updatedDriver;
});
const getDriverLiveLocation = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield prisma_1.default.driver.findUnique({
        where: {
            userId: driverId,
        },
        select: {
            latitude: true,
            longitude: true,
        },
    });
    if (!driver) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Driver not found');
    }
    return driver;
});
const updateBookingStatusIntoDB = (userId, bookingId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedBooking = yield prisma_1.default.bookings.update({
        where: {
            id: bookingId,
            driverId: userId,
        },
        data: {
            bookingStatus: data.bookingStatus,
        },
    });
    const notification = {
        title: 'Your Booking is completed',
        body: `Your recent booking just completed in ${data.location} on ${data.serviceDate} .`,
    };
    const notification2 = {
        title: 'Driver is on the way',
        body: `Driver is on the way to complete your service ${data.location} on ${data.serviceDate} .`,
    };
    // if (fcmToken?.fcmToken) {
    if (data.bookingStatus === client_1.BookingStatus.COMPLETED) {
        const sendNotification = yield notification_services_1.notificationServices.sendSingleNotification(data.customerId, notification);
        if (!sendNotification) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to send notification');
        }
    }
    if (data.bookingStatus === client_1.BookingStatus.IN_PROGRESS) {
        const sendNotification = yield notification_services_1.notificationServices.sendSingleNotification(data.customerId, notification2);
        if (!sendNotification) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to send notification');
        }
    }
    return updatedBooking;
});
const addUserFeedbackIntoDB = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const feedback = yield prisma_1.default.driverFeedback.create({
        data: {
            driverId: userId,
            bookingId: data.bookingId,
            customerId: data.customerId,
            title: data.title,
            feedback: data.feedback,
        },
    });
    if (!feedback) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to add feedback');
    }
    return feedback;
});
const getFeedbackFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const feedback = yield prisma_1.default.driverFeedback.findMany({
        where: {
            driverId: userId,
        },
    });
    return feedback;
});
exports.driverService = {
    addDriverIntoDB,
    getDriverListFromDB,
    getDriverByIdFromDB,
    updateDriverIntoDB,
    deleteDriverFromDB,
    getBookingsFromDB,
    getBookingByIdFromDB,
    updateOnlineStatusIntoDB,
    getDriverLiveLocation,
    updateBookingStatusIntoDB,
    addUserFeedbackIntoDB,
    getFeedbackFromDB,
};
