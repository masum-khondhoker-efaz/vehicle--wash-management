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
exports.adminService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const notification_services_1 = require("../notification/notification.services");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// get all users
const getUserList = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch paginated user data with location
    const customers = yield prisma_1.default.user.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        where: {
            role: client_1.UserRoleEnum.CUSTOMER,
        },
        select: {
            customer: {
                select: {
                    location: true,
                },
            },
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
            status: true,
            role: true,
        },
    });
    // Fetch booking details where paymentStatus is Completed
    const completedBookings = yield prisma_1.default.bookings.findMany({
        where: {
            paymentStatus: client_1.PaymentStatus.COMPLETED,
        },
        select: {
            id: true,
            paymentStatus: true,
            customerId: true,
        },
    });
    // Flatten the customer data to include location directly
    const formattedCustomers = customers.map(customer => {
        var _a, _b, _c;
        return ({
            id: customer.id,
            fullName: customer.fullName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            location: (_c = (_b = (_a = customer.customer) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.location) !== null && _c !== void 0 ? _c : null,
            profileImage: customer.profileImage,
            status: customer.status,
            totalBookings: completedBookings.filter(booking => booking.customerId === customer.id).length,
            role: customer.role,
        });
    });
    // Get the total count of customers with the role of 'CUSTOMER'
    const totalCount = yield prisma_1.default.user.count({
        where: {
            role: client_1.UserRoleEnum.CUSTOMER,
        },
    });
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / limit);
    // Return pagination info along with data
    return {
        currentPage: Math.floor(offset / limit) + 1, // Current page is calculated by dividing offset by limit
        totalPages,
        totalUser: totalCount, // Total number of users
        customers: formattedCustomers,
    };
});
// change user status
const changeUserStatusIntoDB = (userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the user status
    const data = yield prisma_1.default.user.update({
        where: {
            id: userId,
        },
        data: {
            status: status,
        },
    });
    return data;
});
//assign driver
const assignDriverIntoDB = (driverId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the user status
    const data = yield prisma_1.default.bookings.update({
        where: {
            id: bookingId,
            bookingStatus: client_1.BookingStatus.PENDING,
        },
        data: {
            driverId: driverId,
            bookingStatus: client_1.BookingStatus.IN_PROGRESS,
        },
    });
    const notification = {
        title: 'New Booking Assigned',
        body: `You have assigned to a new booking in ${data.location} at ${data.bookingTime} on ${data.serviceDate} .`,
    };
    // if (fcmToken?.fcmToken) {
    if (data.driverId) {
        const sendNotification = yield notification_services_1.notificationServices.sendSingleNotification(driverId, notification);
        if (!sendNotification) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to send notification');
        }
    }
    return data;
});
// get all drivers
const getDriverList = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the drivers with pagination
    const drivers = yield prisma_1.default.user.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        where: {
            role: client_1.UserRoleEnum.DRIVER,
        },
        select: {
            driver: {
                select: {
                    joinDate: true,
                },
            },
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
            status: true,
            role: true,
        },
    });
    const bookings = yield prisma_1.default.bookings.findMany({
        where: {
            paymentStatus: client_1.ServiceStatus.COMPLETED,
        },
        select: {
            id: true,
            serviceStatus: true,
            driverId: true,
        },
    });
    // Get the total count of drivers with the role of 'DRIVER'
    const totalDrivers = yield prisma_1.default.user.count({
        where: {
            role: client_1.UserRoleEnum.DRIVER,
        },
    });
    const formattedDrivers = drivers.map(driver => {
        var _a, _b, _c;
        return ({
            id: driver.id,
            fullName: driver.fullName,
            email: driver.email,
            phoneNumber: driver.phoneNumber,
            joinDate: (_c = (_b = (_a = driver.driver) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.joinDate) !== null && _c !== void 0 ? _c : null,
            profileImage: driver.profileImage,
            status: driver.status,
            role: driver.role,
            totalBookingsCompleted: bookings.filter(booking => booking.driverId === driver.id).length,
        });
    });
    // Get the total number of pages
    const totalPages = Math.ceil(totalDrivers / limit);
    return {
        totalDrivers,
        totalPages,
        formattedDrivers,
    };
});
//service status change
const changeServiceStatusIntoDB = (serviceId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the service status
    const data = yield prisma_1.default.service.update({
        where: {
            id: serviceId,
        },
        data: {
            serviceStatus: status,
        },
    });
    return data;
});
// change driver status
const changeDriverStatusIntoDB = (driverId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the driver status
    const data = yield prisma_1.default.user.update({
        where: {
            id: driverId,
        },
        data: {
            status: status,
        },
    });
    return data;
});
// get all bookings
const getBookingList = (offset, limit, bookingStatus, paymentStatus) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the bookings with optional filters and pagination in descending order
    const bookings = yield prisma_1.default.bookings.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        where: Object.assign(Object.assign({}, (bookingStatus && {
            bookingStatus: {
                in: bookingStatus,
            },
        })), (paymentStatus && {
            paymentStatus: {
                in: paymentStatus,
            },
        })),
        orderBy: {
            createdAt: 'desc', // Order by creation date in descending order
        },
    });
    // Get the total count of pending bookings
    const totalPendingCount = yield prisma_1.default.bookings.count({
        where: {
            bookingStatus: client_1.BookingStatus.IN_PROGRESS,
        },
    });
    // Fetch user details for each booking with selected fields
    const bookingDetailsWithUser = yield Promise.all(bookings.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: {
                id: booking.customerId,
            },
            select: {
                fullName: true,
                email: true,
                profileImage: true,
                phoneNumber: true,
            },
        });
        return {
            id: booking.id,
            bookingStatus: booking.bookingStatus,
            serviceDate: booking.serviceDate,
            bookingTime: booking.bookingTime,
            location: booking.location,
            paymentStatus: booking.paymentStatus,
            user,
        };
    })));
    // Get the total count of cancelled bookings
    const totalCancelledCount = yield prisma_1.default.bookings.count({
        where: {
            bookingStatus: client_1.BookingStatus.CANCELLED,
        },
    });
    // Calculate the total number of pages for both pending and cancelled bookings
    const totalPendingPages = Math.ceil(totalPendingCount / limit);
    const totalCancelledPages = Math.ceil(totalCancelledCount / limit);
    return {
        currentPage: Math.floor(offset / limit) + 1,
        total_pending_pages: totalPendingPages,
        total_cancelled_pages: totalCancelledPages,
        total_pending_bookings: totalPendingCount,
        total_cancelled_bookings: totalCancelledCount,
        bookingDetailsWithUser,
    };
});
// get all services
const getServiceListFromDB = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const services = yield prisma_1.default.service.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        select: {
            id: true,
            serviceName: true,
            serviceImage: true,
            duration: true,
            largeCarPrice: true,
            smallCarPrice: true,
            serviceStatus: true,
            availableTimes: true,
        },
    });
    // Get the total count of services
    const totalServices = yield prisma_1.default.service.count();
    // Get the total number of completed bookings for each service
    const completedBookingsPromises = services.map((service) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.default.bookings.count({
            where: {
                bookingStatus: client_1.BookingStatus.COMPLETED,
            },
        });
    }));
    // Resolve all promises for completed bookings
    const completedBookings = yield Promise.all(completedBookingsPromises);
    // Calculate the total number of completed bookings across all services
    const totalBookingsCompleted = completedBookings.reduce((acc, count) => acc + count, 0);
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalServices / limit);
    return {
        totalServices,
        totalBookingsCompleted,
        totalPages,
        services,
    };
});
// get payment in total
const getPaymentFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Get the total payment
    const totalPayment = yield prisma_1.default.payment.aggregate({
        _sum: {
            paymentAmount: true,
        },
    });
    // Get the total payment count
    const totalPaymentCount = yield prisma_1.default.payment.count();
    // Fetch all payments to calculate month-wise and day-wise totals
    const allPayments = yield prisma_1.default.payment.findMany({
        select: {
            paymentAmount: true,
            createdAt: true, // Assuming `createdAt` is a DateTime field in your schema
        },
    });
    // Group payments by month and day
    const monthWiseTotal = {};
    const dayWiseTotal = {};
    allPayments.forEach(payment => {
        const date = new Date(payment.createdAt);
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
        const day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // Format: YYYY-MM-DD
        if (!monthWiseTotal[month]) {
            monthWiseTotal[month] = 0;
        }
        if (!dayWiseTotal[day]) {
            dayWiseTotal[day] = 0;
        }
        monthWiseTotal[month] += payment.paymentAmount || 0;
        dayWiseTotal[day] += payment.paymentAmount || 0;
    });
    return {
        totalPayment: (_b = (_a = totalPayment === null || totalPayment === void 0 ? void 0 : totalPayment._sum) === null || _a === void 0 ? void 0 : _a.paymentAmount) !== null && _b !== void 0 ? _b : 0,
        totalPaymentCount,
        monthWiseTotal,
        dayWiseTotal,
    };
});
// get all garages
const getGarageList = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the garages with pagination
    const garages = yield prisma_1.default.garages.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        select: {
            id: true,
            garageName: true,
            garageImage: true,
            location: true,
        },
    });
    // Get the total count of garages
    const totalGarages = yield prisma_1.default.garages.count();
    // Get the total number of completed bookings for each garage
    const completedBookingsPromises = garages.map((garage) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.default.bookings.count({
            where: {
                bookingStatus: client_1.BookingStatus.COMPLETED,
            },
        });
    }));
    // Resolve all promises for completed bookings
    const completedBookings = yield Promise.all(completedBookingsPromises);
    // Calculate the total number of completed bookings across all garages
    const totalBookingsCompleted = completedBookings.reduce((acc, count) => acc + count, 0);
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalGarages / limit);
    return {
        totalGarages,
        totalBookingsCompleted,
        totalPages,
        garages,
    };
});
// delete garage
const deleteGarage = (garageId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.garages.delete({
        where: {
            id: garageId,
        },
    });
    return {};
});
const addOfferIntoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.offer.create({
        data,
    });
    return result;
});
const getOfferListFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const offers = yield prisma_1.default.offer.findMany();
    // const totalOffers = await prisma.offer.count();
    return offers;
});
const getDriverLiveLocation = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driver = yield prisma_1.default.driver.findUnique({
            where: {
                userId: driverId,
            },
            select: {
                latitude: true,
                longitude: true,
            },
        });
        return driver;
    }
    catch (error) {
        console.error('Error fetching driver location:', error);
        throw error;
    }
});
const getFeedbackFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const feedback = yield prisma_1.default.driverFeedback.findMany();
    return feedback;
});
const addPrivacyPolicyIntoDB = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.privacyPolicy.create({
        data: {
            content: data.content,
            userId: userId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Privacy policy not found');
    }
    return result;
});
const getPrivacyPolicyFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.privacyPolicy.findMany();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Privacy policy not found');
    }
    return result;
});
exports.adminService = {
    getUserList,
    getBookingList,
    getGarageList,
    deleteGarage,
    changeUserStatusIntoDB,
    getDriverList,
    changeDriverStatusIntoDB,
    assignDriverIntoDB,
    getServiceListFromDB,
    changeServiceStatusIntoDB,
    getPaymentFromDB,
    addOfferIntoDB,
    getOfferListFromDB,
    getDriverLiveLocation,
    getFeedbackFromDB,
    addPrivacyPolicyIntoDB,
    getPrivacyPolicyFromDB,
};
