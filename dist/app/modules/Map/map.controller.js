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
exports.MapController = void 0;
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const map_service_1 = require("./map.service");
// get companies
const getAllPlaces = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   const user = req?.user as JwtPayload;
    const { latitude, longitude, garageName } = req.query;
    try {
        const result = yield map_service_1.MapServices.getCompaniesFromDb(latitude ? parseFloat(latitude) : 0, longitude ? parseFloat(longitude) : 0, garageName ? String(garageName) : undefined);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: 'Garages retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            data: {},
        });
    }
}));
const getDistanceFromGarage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, garageId } = req.body;
    try {
        const result = yield map_service_1.MapServices.getDistanceFromGarageFromDb(latitude ? parseFloat(latitude) : 0, longitude ? parseFloat(longitude) : 0, garageId);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: 'Distance retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            data: {},
        });
    }
}));
exports.MapController = {
    getAllPlaces,
    getDistanceFromGarage,
};
