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
exports.carController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const multerUpload_1 = require("../../utils/multerUpload");
const car_service_1 = require("./car.service");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const addCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    if (!file) {
        throw new AppError(httpStatus.CONFLICT, 'file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(file, 'retire-professional');
    const carData = {
        data,
        carImage: fileUrl,
    };
    const result = yield car_service_1.carService.addCarIntoDB(user.id, carData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service deleted successfully',
        data: result,
    });
}));
const getCarList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const cars = yield car_service_1.carService.getCarListFromDB(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car list',
        data: cars,
    });
}));
const getCarById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const carId = req.params.carId;
    const car = yield car_service_1.carService.getCarByIdFromDB(carId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car details',
        data: car,
    });
}));
const updateCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const carId = req.params.carId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let carData = Object.assign({}, data);
    if (file) {
        const fileUrl = yield (0, updateMulterUpload_1.uploadFileToSpaceForUpdate)(file, 'retire-professional');
        carData.carImage = fileUrl;
    }
    const result = yield car_service_1.carService.updateCarIntoDB(user.id, carId, carData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car updated successfully',
        data: result,
    });
}));
const deleteCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const carId = req.params.carId;
    const result = yield car_service_1.carService.deleteCarFromDB(user.id, carId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Car deleted successfully',
        data: result,
    });
}));
exports.carController = {
    addCar,
    getCarList,
    getCarById,
    updateCar,
    deleteCar,
};
