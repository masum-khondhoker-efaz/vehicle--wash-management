import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { serviceService } from './service.service';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';
import AppError from '../../errors/AppError';

const addService = catchAsync(async (req, res) => {
  const user = req.user as any;
  const data = req.body;
  const file = req.file;

  if (!file) {
    throw new AppError(httpStatus.CONFLICT, 'file not found');
  }
  const fileUrl = await uploadFileToSpace(file, 'retire-professional');

  const serviceData = {
    data,
    serviceImage: fileUrl,
  };
  const result = await serviceService.addServiceIntoDB(user.id, serviceData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Service registered successfully',
    data: result,
  });
});

const getServiceList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const page = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
  const offset = (page - 1) * limit;
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : '';
  const services = await serviceService.getServiceListFromDB(
    user.id,
    offset,
    limit,
    searchTerm,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service list',
    data: services,
  });
});

const getServiceById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const serviceId = req.params.serviceId;
  const service = await serviceService.getServiceByIdFromDB(user.id, serviceId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service details',
    data: service,
  });
});

const updateService = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  const user = req.user as any;
  const data = req.body;
  const file = req.file;

  let serviceData: { data: any; serviceImage?: string } = { data };

  if (file) {
    const fileUrl = await uploadFileToSpaceForUpdate(
      file,
      'retire-professional',
    );
    serviceData.serviceImage = fileUrl;
  }
  const result = await serviceService.updateServiceIntoDB(
    user.id,
    serviceId,
    serviceData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service updated successfully',
    data: result,
  });
});

const deleteService = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  const user = req.user as any;

  const result = await serviceService.deleteServiceFromDB(user.id, serviceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service deleted successfully',
    data: result,
  });
});

export const serviceController = {
  addService,
  getServiceList,
  getServiceById,
  updateService,
  deleteService,
};
