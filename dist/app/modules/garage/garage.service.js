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
exports.garageService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const registerGarageIntoDB = (userId, garageData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, garageImage } = garageData;
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Create the garage
        const createdGarage = yield prisma.garages.create({
            data: {
                userId: userId,
                garageName: data.garageName,
                garageImage: garageImage,
                description: data.description,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                minimumPrice: data.minimumPrice,
                availableTimes: data.availableTimes,
            },
        });
        // Add services
        const services = data.services.map((service) => ({
            serviceName: service.serviceName,
            servicePrice: service.servicePrice,
            garageId: createdGarage.id,
            userId: userId,
        }));
        yield prisma.service.createMany({
            data: services,
        });
        // Update garage with service IDs
        const serviceIds = yield prisma.service.findMany({
            where: { garageId: createdGarage.id },
            select: { id: true },
        });
        yield prisma.garages.update({
            where: { id: createdGarage.id },
            data: {
                serviceIds: serviceIds.map((service) => service.id),
            },
        });
        return createdGarage;
    }));
    return transaction;
});
const getGarageListFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const garages = yield prisma_1.default.garages.findMany({
        include: {
            service: true,
        },
    });
    return garages;
});
const getGarageByIdFromDB = (garageId) => __awaiter(void 0, void 0, void 0, function* () {
    const garage = yield prisma_1.default.garages.findUnique({
        where: {
            id: garageId,
        },
        include: {
            service: true,
        },
    });
    return garage;
});
const updateGarageIntoDB = (userId, garageId, garageData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Update the garage
        const updatedGarage = yield prisma.garages.update({
            where: {
                id: garageId,
                userId: userId,
            },
            data: {
                garageName: garageData.garageName,
                garageImage: garageData.garageImage,
                description: garageData.description,
                location: garageData.location,
                latitude: garageData.latitude,
                longitude: garageData.longitude,
                minimumPrice: garageData.minimumPrice,
                availableTimes: garageData.availableTimes,
            },
        });
        // Add services
        const services = garageData.services.map((service) => ({
            serviceName: service.serviceName,
            servicePrice: service.servicePrice,
            garageId: updatedGarage.id,
            userId: userId,
        }));
        yield prisma.service.deleteMany({
            where: {
                garageId: updatedGarage.id,
            },
        });
        yield prisma.service.createMany({
            data: services,
        });
        // Update garage with service IDs
        const serviceIds = yield prisma.service.findMany({
            where: { garageId: updatedGarage.id },
            select: { id: true },
        });
        yield prisma.garages.update({
            where: { id: updatedGarage.id },
            data: {
                serviceIds: serviceIds.map((service) => service.id),
            },
        });
        return updatedGarage;
    }));
    return transaction;
});
const deleteGarageFromDB = (userId, garageId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete services associated with the garage
        yield prisma.service.deleteMany({
            where: {
                garageId: garageId,
                userId: userId,
            },
        });
        // Delete the garage
        const deletedGarage = yield prisma.garages.delete({
            where: {
                id: garageId,
                userId: userId,
            },
        });
        return deletedGarage;
    }));
    return transaction;
});
const addServiceIntoDB = (userId, garageId, serviceData) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceName, servicePrice } = serviceData;
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const service = yield prisma.service.create({
            data: {
                serviceName: serviceName,
                servicePrice: servicePrice,
                garageId: garageId,
                userId: userId,
            },
        });
        const garage = yield prisma.garages.update({
            where: {
                id: garageId,
            },
            data: {
                serviceIds: {
                    push: service.id,
                },
            },
        });
        return { service, garage };
    }));
    return transaction;
});
const getServicesFromDB = (userId, garageId) => __awaiter(void 0, void 0, void 0, function* () {
    const services = yield prisma_1.default.service.findMany({
        where: {
            garageId: garageId,
            userId: userId,
        },
    });
    return services;
});
const getServiceByIdFromDB = (userId, serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield prisma_1.default.service.findUnique({
        where: {
            id: serviceId,
            userId: userId,
        },
    });
    return service;
});
const updateServiceIntoDB = (userId, serviceId, serviceData) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceName, servicePrice } = serviceData;
    const service = yield prisma_1.default.service.update({
        where: {
            id: serviceId,
            userId: userId,
        },
        data: {
            serviceName: serviceName,
            servicePrice: servicePrice,
        },
    });
    return service;
});
const deleteServiceFromDB = (userId, garageId, serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const service = yield prisma.service.delete({
            where: {
                id: serviceId,
                userId: userId,
                garageId: garageId,
            },
        });
        const garage = yield prisma.garages.findUnique({
            where: {
                id: garageId,
            },
            select: {
                serviceIds: true,
            },
        });
        const serviceIds = yield prisma.garages.update({
            where: {
                id: garageId,
            },
            data: {
                serviceIds: {
                    set: garage === null || garage === void 0 ? void 0 : garage.serviceIds.filter((id) => id !== serviceId),
                },
            },
        });
        return { service, serviceIds };
    }));
    return transaction;
});
const getGarageServicesFromDB = (userId, garageId) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.garageService = {
    registerGarageIntoDB,
    getGarageListFromDB,
    getGarageByIdFromDB,
    updateGarageIntoDB,
    deleteGarageFromDB,
    addServiceIntoDB,
    getServicesFromDB,
    getServiceByIdFromDB,
    updateServiceIntoDB,
    deleteServiceFromDB,
    getGarageServicesFromDB,
};
