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
exports.driverController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const multerUpload_1 = require("../../utils/multerUpload");
const driver_service_1 = require("./driver.service");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const addDriver = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    if (!file) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(file, 'retire-professional');
    const driverData = {
        data,
        driverImage: fileUrl,
    };
    const result = yield driver_service_1.driverService.addDriverIntoDB(user.id, driverData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'Driver registered successfully',
        data: result,
    });
}));
const getDriverList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const drivers = yield driver_service_1.driverService.getDriverListFromDB(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver list',
        data: drivers,
    });
}));
const getDriverById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.driverId;
    const driver = yield driver_service_1.driverService.getDriverByIdFromDB(driverId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver details',
        data: driver,
    });
}));
const updateDriver = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.driverId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let driverData = Object.assign({}, data);
    if (file) {
        const fileUrl = yield (0, updateMulterUpload_1.uploadFileToSpaceForUpdate)(file, 'retire-professional');
        driverData.driverImage = fileUrl;
    }
    const result = yield driver_service_1.driverService.updateDriverIntoDB(user.id, driverId, driverData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver updated successfully',
        data: result,
    });
}));
const deleteDriver = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.driverId;
    const user = req.user;
    const result = yield driver_service_1.driverService.deleteDriverFromDB(user.id, driverId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver deleted successfully',
        data: result,
    });
}));
const getBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const bookings = yield driver_service_1.driverService.getBookingsFromDB(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Booking list',
        data: bookings,
    });
}));
const getBookingById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const bookingId = req.params.bookingId;
    const booking = yield driver_service_1.driverService.getBookingByIdFromDB(user.id, bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Booking details',
        data: booking,
    });
}));
exports.driverController = {
    addDriver,
    getDriverList,
    getDriverById,
    updateDriver,
    deleteDriver,
    getBookings,
    getBookingById,
};
