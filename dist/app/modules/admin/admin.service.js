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
// get all users
const getUserList = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch paginated user data with cars
    const customers = yield prisma_1.default.user.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        where: {
            role: client_1.UserRoleEnum.CUSTOMER,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
            role: true,
        },
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
        customers,
    };
});
// get all bookings
const getBookingList = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the pending bookings with pagination
    const bookings = yield prisma_1.default.bookings.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        where: {
            bookingStatus: client_1.BookingStatus.PENDING,
        },
        select: {
            id: true,
        },
    });
    // Get the total count of pending bookings
    const totalPendingCount = yield prisma_1.default.bookings.count({
        where: {
            bookingStatus: client_1.BookingStatus.PENDING,
        },
    });
    // Get the cancelled bookings with pagination (if needed)
    const cancelBookings = yield prisma_1.default.bookings.findMany({
        skip: offset, // Skip the first `offset` records
        take: limit, // Limit the result to `limit` records
        where: {
            bookingStatus: client_1.BookingStatus.CANCELLED,
        },
        select: {
            id: true,
        },
    });
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
        bookings,
        total_cancelled_bookings: totalCancelledCount,
        cancelBookings,
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
exports.adminService = {
    getUserList,
    getBookingList,
    getGarageList,
    deleteGarage,
};
