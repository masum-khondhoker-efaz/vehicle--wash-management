"use strict";
// import httpStatus from 'http-status';
// import sendResponse from '../../utils/sendResponse';
// import catchAsync from '../../utils/catchAsync';
// // import { garageService } from './garage.service';
// import { uploadFileToSpace } from '../../utils/multerUpload';
// import { JwtPayload } from 'jsonwebtoken';
// import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';
// import AppError from '../../errors/AppError';
// const registerGarage = catchAsync(async (req, res) => {
//     const user = req.user as any;
//     const data = req.body;
//     const file = req.file;
//     // console.log(file, 'check file');
//     if (!file) {
//       throw new AppError(httpStatus.CONFLICT, 'file not found');
//     }
//     const fileUrl = await uploadFileToSpace(file, 'retire-professional');
//     // console.log(fileUrl, 'check url');
//     const garageData = {
//       data,
//       garageImage: fileUrl,
//     };
//     const result = await garageService.registerGarageIntoDB(user.id
// , garageData);
//     sendResponse(res, {
//         statusCode: httpStatus.CREATED,
//         message: 'Garage registered successfully',
//         data: result,
//     });
//     }
// );
// const getGarageList = catchAsync(async (req, res) => {
//     const garages = await garageService.getGarageListFromDB();
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Garage list',
//         data: garages,
//     });
// });
// const getGarageById = catchAsync(async (req, res) => {
//     const garageId = req.params.garageId;
//     const garage = await garageService.getGarageByIdFromDB(garageId);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Garage details',
//         data: garage,
//     });
// });
// const updateGarage = catchAsync(async (req, res) => {
//     const garageId = req.params.garageId;
//     const user = req.user as any;
//     const data = req.body;
//     const file = req.file;
//    let garageData = { ...data };
//    if (file) {
//      const fileUrl = await uploadFileToSpaceForUpdate(
//        file,
//        'retire-professional',
//      );
//      garageData.garageImage = fileUrl;
//    }
//     const result = await garageService.updateGarageIntoDB(user.id, garageId, garageData);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Garage updated successfully',
//         data: result,
//     });
// });
// const deleteGarage = catchAsync(async (req, res) => {
//     const garageId = req.params.garageId;
//     const user = req.user as any;
//     const result = await garageService.deleteGarageFromDB(user.id, garageId);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Garage deleted successfully',
//         data: result,
//     });
// });
// const addService = catchAsync(async (req, res) => {
//     const user = req.user as any;
//     const garageId = req.params.garageId;
//     const data = req.body;
//     const result = await garageService.addServiceIntoDB(user.id, garageId, data);
//     sendResponse(res, {
//         statusCode: httpStatus.CREATED,
//         message: 'Service added successfully',
//         data: result,
//     });
// });
// const getServices = catchAsync(async (req, res) => {
//   const user = req.user as any;
//     const garageId = req.params.garageId;
//     const services = await garageService.getServicesFromDB(user.id, garageId);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Service list',
//         data: services,
//     });
// });
// const getServiceById = catchAsync(async (req, res) => {
//     const user = req.user as any;
//     const serviceId = req.params.serviceId;
//     const service = await garageService.getServiceByIdFromDB(user.id, serviceId);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Service details',
//         data: service,
//     });
// });
// const updateService = catchAsync(async (req, res) => {
//     const user = req.user as any;
//     const serviceId = req.params.serviceId;
//     const data = req.body;
//     const result = await garageService.updateServiceIntoDB(user.id, serviceId, data);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Service updated successfully',
//         data: result,
//     });
// }); 
// const deleteService = catchAsync(async (req, res) => {
//     const user = req.user as any;
//     const garageId = req.params.garageId;
//     const serviceId = req.params.serviceId;
//     const result = await garageService.deleteServiceFromDB(
//       user.id,
//       garageId, 
//       serviceId,
//     );
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Service deleted successfully',
//         data: result,
//     });
// });
// const getGarageServices = catchAsync(async (req, res) => {
//     const user = req.user as any;
//     const services = await garageService.getGarageServicesFromDB(user.id, req.body);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         message: 'Garage services',
//         data: services,
//     });
// });
// export const garageController = {
//     registerGarage,
//     getGarageList,
//     getGarageById,
//     updateGarage,
//     deleteGarage,
//     addService,
//     getServices,
//     getServiceById,
//     updateService,
//     deleteService,
//     getGarageServices,
// };
