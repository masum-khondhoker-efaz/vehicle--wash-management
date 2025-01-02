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
exports.adminController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const admin_service_1 = require("./admin.service");
// get all users
const getUserList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const offset = (page - 1) * limit;
    const result = yield admin_service_1.adminService.getUserList(offset, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'User list',
        data: result,
    });
}));
//change user status
const changeUserStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const status = req.params.status;
    const result = yield admin_service_1.adminService.changeUserStatusIntoDB(userId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'User status updated successfully',
        data: result,
    });
}));
// assign driver
const assignDriver = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.driverId;
    const bookingId = req.params.bookingId;
    const result = yield admin_service_1.adminService.assignDriverIntoDB(driverId, bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver assigned successfully',
        data: result,
    });
}));
// get all drivers
const getDriverList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = yield admin_service_1.adminService.getDriverList(offset, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver list',
        data: result,
    });
}));
//service status change
const changeServiceStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    const status = req.params.status;
    const result = yield admin_service_1.adminService.changeServiceStatusIntoDB(serviceId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service status updated successfully',
        data: result,
    });
}));
// get all bookings
const getBookingList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 50; // Default to 50 items per page
    const offset = (page - 1) * limit;
    const result = yield admin_service_1.adminService.getBookingList(offset, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Booking list',
        data: result,
    });
}));
// get all services
const getServiceList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = yield admin_service_1.adminService.getServiceListFromDB(offset, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service list',
        data: result,
    });
}));
// get payment in total
const getPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.adminService.getPaymentFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Total payment',
        data: result,
    });
}));
// get all garages
const getGarageList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = yield admin_service_1.adminService.getGarageList(offset, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage list',
        data: result,
    });
}));
// delete garage
const deleteGarage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const garageId = req.params.garageId;
    const result = yield admin_service_1.adminService.deleteGarage(garageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage deleted successfully',
        data: result,
    });
}));
const addOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield admin_service_1.adminService.addOfferIntoDB(data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Offer added successfully',
        data: result,
    });
}));
const getOfferList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.adminService.getOfferListFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Offer list retrieved successfully',
        data: result,
    });
}));
const getDriverLiveLocation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.driverId;
    const location = yield admin_service_1.adminService.getDriverLiveLocation(driverId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Driver live location retrieved successfully',
        data: location,
    });
}));
const getFeedback = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const feedback = yield admin_service_1.adminService.getFeedbackFromDB(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Feedback list',
        data: feedback,
    });
}));
const addPrivacyPolicy = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const result = yield admin_service_1.adminService.addPrivacyPolicyIntoDB(user.id, data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Privacy policy added successfully',
        data: result,
    });
}));
const getPrivacyPolicy = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.adminService.getPrivacyPolicyFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Privacy policy retrieved successfully',
        data: result,
    });
}));
const carModelAdd = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield admin_service_1.adminService.carModelAddIntoDb(data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car Model added successfully',
        data: result,
    });
}));
const carModelList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.adminService.carModelListFromDb();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car Model list retrieved successfully',
        data: result,
    });
}));
const carModelUpdate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const carModelId = req.params.carModelId;
    const data = req.body;
    const result = yield admin_service_1.adminService.carModelUpdateIntoDb(carModelId, data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car Model updated successfully',
        data: result,
    });
}));
const carModelDelete = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const carModelId = req.params.carModelId;
    const result = yield admin_service_1.adminService.carModelDeleteFromDb(carModelId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car Model deleted successfully',
        data: result,
    });
}));
exports.adminController = {
    getUserList,
    getBookingList,
    getGarageList,
    deleteGarage,
    changeUserStatus,
    getDriverList,
    assignDriver,
    getServiceList,
    changeServiceStatus,
    getPayment,
    addOffer,
    getOfferList,
    getDriverLiveLocation,
    getFeedback,
    addPrivacyPolicy,
    getPrivacyPolicy,
    carModelAdd,
    carModelList,
    carModelUpdate,
    carModelDelete,
};
