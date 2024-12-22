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
exports.MapServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const distance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};
// Function to get companies within a bounding box around the given coordinates
const getCompaniesFromDb = (latitude, longitude, garageName) => __awaiter(void 0, void 0, void 0, function* () {
    if (latitude && longitude) {
        const garages = yield prisma_1.default.garages.findMany();
        const nearbyGarages = garages.filter(garage => {
            if (garage.latitude === null || garage.longitude === null) {
                return false;
            }
            const garageLocation = {
                latitude: garage.latitude,
                longitude: garage.longitude,
            };
            return (distance(latitude, longitude, garageLocation.latitude, garageLocation.longitude) <= 200);
        });
        return nearbyGarages;
    }
    else if (garageName && garageName.trim()) {
        const garages = yield prisma_1.default.garages.findMany();
        const filteredCompanies = garages.filter(garage => {
            return garage.garageName.toLowerCase().includes(garageName.toLowerCase());
        });
        return filteredCompanies;
    }
    else {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Either latitude/longitude or a valid garage name must be provided');
    }
});
// distance between two location
const getDistanceFromGarageFromDb = (latitude, longitude, garageID) => __awaiter(void 0, void 0, void 0, function* () {
    const garage = yield prisma_1.default.garages.findUnique({
        where: { id: garageID },
    });
    if (!garage || garage.latitude === null || garage.longitude === null) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Garage not found or invalid coordinates');
    }
    const dist = distance(latitude, longitude, garage.latitude, garage.longitude);
    return `${dist.toFixed(2)} km`;
});
exports.MapServices = {
    getCompaniesFromDb,
    getDistanceFromGarageFromDb,
};
