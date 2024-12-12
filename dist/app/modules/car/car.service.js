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
exports.carService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const addCarIntoDB = (userId, carData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, carImage } = carData;
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Create the car
        const createdCar = yield prisma.car.create({
            data: {
                userId: userId,
                carName: data.carName,
                carImage: carImage,
                driverId: data.driverId,
            },
        });
        return createdCar;
    }));
    return transaction;
});
const getCarListFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cars = yield prisma_1.default.car.findMany({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            carName: true,
            carImage: true,
            driverId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return cars;
});
const getCarByIdFromDB = (carId) => __awaiter(void 0, void 0, void 0, function* () {
    const car = yield prisma_1.default.car.findUnique({
        where: {
            id: carId,
        },
    });
    return car;
});
const updateCarIntoDB = (userId, carId, carData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Update the car
        const updatedCar = yield prisma.car.update({
            where: {
                id: carId,
            },
            data: {
                carName: carData.carName,
                carImage: carData.carImage,
                driverId: carData.driverId,
            },
        });
        return updatedCar;
    }));
    return transaction;
});
const deleteCarFromDB = (userId, carId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete the car
        yield prisma.car.delete({
            where: {
                id: carId,
            },
        });
        return 'Car deleted successfully';
    }));
    return transaction;
});
exports.carService = {
    addCarIntoDB,
    getCarListFromDB,
    getCarByIdFromDB,
    updateCarIntoDB,
    deleteCarFromDB,
};
