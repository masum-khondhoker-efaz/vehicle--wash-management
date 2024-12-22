'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.serviceService = void 0;
const prisma_1 = __importDefault(require('../../utils/prisma'));
const addServiceIntoDB = (userId, serviceData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { data, serviceImage } = serviceData;
    const service = yield prisma_1.default.service.create({
      data: Object.assign(Object.assign({}, data), {
        serviceImage: serviceImage,
        userId: userId,
      }),
    });
    if (!service) {
      throw new AppError(httpStatus.CONFLICT, 'Service not created');
    }
    return service;
  });
const getServiceListFromDB = userId =>
  __awaiter(void 0, void 0, void 0, function* () {
    const services = yield prisma_1.default.service.findMany();
    if (!services) {
      throw new AppError(httpStatus.CONFLICT, 'Services not found');
    }
    return services;
  });
const getServiceByIdFromDB = (userId, serviceId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const service = yield prisma_1.default.service.findUnique({
      where: {
        id: serviceId,
      },
    });
    if (!service) {
      throw new AppError(httpStatus.CONFLICT, 'Service not found');
    }
    return service;
  });
const updateServiceIntoDB = (userId, serviceId, serviceData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { data, serviceImage } = serviceData;
    const service = yield prisma_1.default.service.update({
      where: {
        id: serviceId,
      },
      data: Object.assign(Object.assign({}, data), {
        serviceImage: serviceImage,
      }),
    });
    if (!service) {
      throw new AppError(httpStatus.CONFLICT, 'Service not updated');
    }
    return service;
  });
const deleteServiceFromDB = (userId, serviceId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const service = yield prisma_1.default.service.delete({
      where: {
        id: serviceId,
      },
    });
    if (!service) {
      throw new AppError(httpStatus.CONFLICT, 'Service not deleted');
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
