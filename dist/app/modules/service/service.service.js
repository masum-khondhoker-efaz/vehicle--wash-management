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
exports.serviceService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const querBuilder_1 = __importDefault(require("../../utils/querBuilder"));
const addServiceIntoDB = (userId, serviceData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, serviceImage } = serviceData;
    const service = yield prisma_1.default.service.create({
        data: Object.assign(Object.assign({}, data), { serviceImage: serviceImage, userId: userId }),
    });
    if (!service) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service not created');
    }
    return service;
});
const getServiceListFromDB = (userId, offset, limit, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new querBuilder_1.default(prisma_1.default.service.findMany);
    const { query, options } = queryBuilder
        .paginate({ page: Math.floor(offset / limit) + 1, limit })
        .setSearch(['serviceName'], searchTerm)
        .build();
    const services = yield prisma_1.default.service.findMany({
        where: query.where,
        skip: options.skip,
        take: options.limit,
    });
    if (!services) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Services not found');
    }
    const totalCount = yield prisma_1.default.service.count({
        where: query,
    });
    const totalPages = Math.ceil(totalCount / limit);
    return {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages,
        total_services: totalCount,
        services,
    };
});
const getServiceByIdFromDB = (userId, serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield prisma_1.default.service.findUnique({
        where: {
            id: serviceId,
        },
    });
    if (!service) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service not found');
    }
    return service;
});
const updateServiceIntoDB = (userId, serviceId, serviceData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, serviceImage } = serviceData;
    const service = yield prisma_1.default.service.update({
        where: {
            id: serviceId,
        },
        data: Object.assign(Object.assign({}, data), { serviceImage: serviceImage }),
    });
    if (!service) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service not updated');
    }
    return service;
});
const deleteServiceFromDB = (userId, serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield prisma_1.default.service.delete({
        where: {
            id: serviceId,
        },
    });
    if (!service) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service not deleted');
    }
    return service;
});
exports.serviceService = {
    addServiceIntoDB,
    getServiceListFromDB,
    getServiceByIdFromDB,
    updateServiceIntoDB,
    deleteServiceFromDB,
};
