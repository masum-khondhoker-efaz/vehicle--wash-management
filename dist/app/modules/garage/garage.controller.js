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
exports.garageController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const garage_service_1 = require("./garage.service");
const multerUpload_1 = require("../../utils/multerUpload");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const registerGarage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    // console.log(file, 'check file');
    if (!file) {
        throw new Error('file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(file, 'retire-professional');
    // console.log(fileUrl, 'check url');
    const garageData = {
        data,
        garageImage: fileUrl,
    };
    const result = yield garage_service_1.garageService.registerGarageIntoDB(user.id, garageData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'Garage registered successfully',
        data: result,
    });
}));
const getGarageList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const garages = yield garage_service_1.garageService.getGarageListFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage list',
        data: garages,
    });
}));
const getGarageById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const garageId = req.params.garageId;
    const garage = yield garage_service_1.garageService.getGarageByIdFromDB(garageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage details',
        data: garage,
    });
}));
const updateGarage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const garageId = req.params.garageId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let garageData = Object.assign({}, data);
    if (file) {
        const fileUrl = yield (0, updateMulterUpload_1.uploadFileToSpaceForUpdate)(file, 'retire-professional');
        garageData.garageImage = fileUrl;
    }
    const result = yield garage_service_1.garageService.updateGarageIntoDB(user.id, garageId, garageData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage updated successfully',
        data: result,
    });
}));
const deleteGarage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const garageId = req.params.garageId;
    const user = req.user;
    const result = yield garage_service_1.garageService.deleteGarageFromDB(user.id, garageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage deleted successfully',
        data: result,
    });
}));
const addService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const garageId = req.params.garageId;
    const data = req.body;
    const result = yield garage_service_1.garageService.addServiceIntoDB(user.id, garageId, data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'Service added successfully',
        data: result,
    });
}));
const getServices = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const garageId = req.params.garageId;
    const services = yield garage_service_1.garageService.getServicesFromDB(user.id, garageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service list',
        data: services,
    });
}));
const getServiceById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const serviceId = req.params.serviceId;
    const service = yield garage_service_1.garageService.getServiceByIdFromDB(user.id, serviceId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service details',
        data: service,
    });
}));
const updateService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const serviceId = req.params.serviceId;
    const data = req.body;
    const result = yield garage_service_1.garageService.updateServiceIntoDB(user.id, serviceId, data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service updated successfully',
        data: result,
    });
}));
const deleteService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const garageId = req.params.garageId;
    const serviceId = req.params.serviceId;
    const result = yield garage_service_1.garageService.deleteServiceFromDB(user.id, garageId, serviceId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Service deleted successfully',
        data: result,
    });
}));
const getGarageServices = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const services = yield garage_service_1.garageService.getGarageServicesFromDB(user.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Garage services',
        data: services,
    });
}));
exports.garageController = {
    registerGarage,
    getGarageList,
    getGarageById,
    updateGarage,
    deleteGarage,
    addService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    getGarageServices,
};
