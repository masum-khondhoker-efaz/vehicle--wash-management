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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Service not created');
    }
    return service;
});
// const getServiceListFromDB = async (
//   userId: string,
//   offset: number,
//   limit: number,
//   searchTerm: string,
// ) => {
//   const queryBuilder = new QueryBuilder(prisma.service.findMany);
//   const { query, options } = queryBuilder
//     .paginate({ page: Math.floor(offset / limit) + 1, limit })
//     .setSearch(['serviceName'], searchTerm)
//     .build();
//   const services = await prisma.service.findMany({
//     where: {
//       ...query.where,
//       OR: [
//         {
//           serviceName: {
//             contains: searchTerm,
//             mode: 'insensitive',
//           },
//         },
//       ],
//     },
//     skip: options.skip,
//     take: options.limit,
//   });
//   if (!services) {
//     throw new AppError(httpStatus.CONFLICT, 'Services not found');
//   }
//   const totalCount = await prisma.service.count({
//     where: {
//       ...query.where,
//       OR: [
//         {
//           serviceName: {
//             contains: searchTerm,
//             mode: 'insensitive',
//           },
//         },
//       ],
//     },
//   });
//   const totalPages = Math.ceil(totalCount / limit);
//   return {
//     currentPage: Math.floor(offset / limit) + 1,
//     totalPages,
//     total_services: totalCount,
//     services,
//   };
// };
const getServiceListFromDB = (userId, offset, limit, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new querBuilder_1.default(prisma_1.default.service.findMany);
    const { query, options } = queryBuilder
        .paginate({ page: Math.floor(offset / limit) + 1, limit })
        .setSearch(['serviceName'], searchTerm)
        .build();
    const services = yield prisma_1.default.service.findMany({
        where: Object.assign(Object.assign({}, query.where), { OR: [
                {
                    serviceName: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
            ] }),
        skip: options.skip,
        take: options.limit,
        include: {
            reviews: true,
        },
    });
    if (!services) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Services not found');
    }
    const servicesWithReviewStats = services.map(service => {
        const totalReviews = service.reviews.length;
        const avgRating = totalReviews
            ? service.reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
            : 0;
        // Exclude the reviews field from the response
        const { reviews } = service, serviceWithoutReviews = __rest(service, ["reviews"]);
        return Object.assign(Object.assign({}, serviceWithoutReviews), { totalReviews,
            avgRating });
    });
    const totalCount = yield prisma_1.default.service.count({
        where: Object.assign(Object.assign({}, query.where), { OR: [
                {
                    serviceName: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
            ] }),
    });
    const totalPages = Math.ceil(totalCount / limit);
    return {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages,
        total_services: totalCount,
        services: servicesWithReviewStats,
    };
});
const getServiceByIdFromDB = (userId, serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield prisma_1.default.service.findUnique({
        where: {
            id: serviceId,
        },
        include: {
            reviews: true,
        },
    });
    if (!service) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Service not found');
    }
    const totalReviews = service.reviews.length;
    const avgRating = totalReviews
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
        : 0;
    // Exclude the reviews field from the response
    const { reviews } = service, serviceWithoutReviews = __rest(service, ["reviews"]);
    return Object.assign(Object.assign({}, serviceWithoutReviews), { totalReviews,
        avgRating });
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
