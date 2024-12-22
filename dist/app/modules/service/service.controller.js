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
exports.serviceController = void 0;
const http_status_1 = __importDefault(require('http-status'));
const sendResponse_1 = __importDefault(require('../../utils/sendResponse'));
const catchAsync_1 = __importDefault(require('../../utils/catchAsync'));
const service_service_1 = require('./service.service');
const multerUpload_1 = require('../../utils/multerUpload');
const updateMulterUpload_1 = require('../../utils/updateMulterUpload');
const addService = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    if (!file) {
      throw new AppError(httpStatus.CONFLICT, 'file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(
      file,
      'retire-professional',
    );
    const serviceData = {
      data,
      serviceImage: fileUrl,
    };
    const result = yield service_service_1.serviceService.addServiceIntoDB(
      user.id,
      serviceData,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.CREATED,
      message: 'Service registered successfully',
      data: result,
    });
  }),
);
const getServiceList = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const services =
      yield service_service_1.serviceService.getServiceListFromDB(user.id);
    (0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      message: 'Service list',
      data: services,
    });
  }),
);
const getServiceById = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const serviceId = req.params.serviceId;
    const service = yield service_service_1.serviceService.getServiceByIdFromDB(
      user.id,
      serviceId,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      message: 'Service details',
      data: service,
    });
  }),
);
const updateService = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let serviceData = { data };
    if (file) {
      const fileUrl = yield (0,
      updateMulterUpload_1.uploadFileToSpaceForUpdate)(
        file,
        'retire-professional',
      );
      serviceData.serviceImage = fileUrl;
    }
    const result = yield service_service_1.serviceService.updateServiceIntoDB(
      user.id,
      serviceId,
      serviceData,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      message: 'Service updated successfully',
      data: result,
    });
  }),
);
const deleteService = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    const user = req.user;
    const result = yield service_service_1.serviceService.deleteServiceFromDB(
      user.id,
      serviceId,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      message: 'Service deleted successfully',
      data: result,
    });
  }),
);
exports.serviceController = {
  addService,
  getServiceList,
  getServiceById,
  updateService,
  deleteService,
};
