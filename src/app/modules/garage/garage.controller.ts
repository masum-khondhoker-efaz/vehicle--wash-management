import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { garageService } from './garage.service';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';



const registerGarage = catchAsync(async (req, res) => {
    const userId  = req.user.id;
    const data = req.body;
    const file = req.file;
    // console.log(file, 'check file');

    if (!file) {
      throw new Error('file not found');
    }
    const fileUrl = await uploadFileToSpace(file, 'retire-professional');
    // console.log(fileUrl, 'check url');
    
    const garageData = {
      data,
      garageImage: fileUrl,
    };
    
    const result = await garageService.registerGarageIntoDB(userId, garageData);
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Garage registered successfully',
        data: result,
    });
    }
);

const getGarageList = catchAsync(async (req, res) => {
    const garages = await garageService.getGarageListFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Garage list',
        data: garages,
    });
});


const getGarageById = catchAsync(async (req, res) => {
    const garageId = req.params.garageId;
    const garage = await garageService.getGarageByIdFromDB(garageId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Garage details',
        data: garage,
    });
});

const updateGarage = catchAsync(async (req, res) => {
    const garageId = req.params.garageId;
    const userId = req.user.id;
    const data = req.body;
    const file = req.file;
  
   let garageData = { ...data };

   if (file) {
     const fileUrl = await uploadFileToSpaceForUpdate(
       file,
       'retire-professional',
     );
     garageData.garageImage = fileUrl;
   }
  

    const result = await garageService.updateGarageIntoDB(userId, garageId, garageData);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Garage updated successfully',
        data: result,
    });
});

const deleteGarage = catchAsync(async (req, res) => {
    const garageId = req.params.garageId;
    const userId = req.user.id;
    const result = await garageService.deleteGarageFromDB(userId, garageId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Garage deleted successfully',
        data: result,
    });
});


const addService = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const garageId = req.params.garageId;
    const data = req.body;
    const result = await garageService.addServiceIntoDB(userId, garageId, data);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Service added successfully',
        data: result,
    });
});


const getServices = catchAsync(async (req, res) => {
  const userId = req.user.id;
    const garageId = req.params.garageId;
    const services = await garageService.getServicesFromDB(userId, garageId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Service list',
        data: services,
    });
});

const getServiceById = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const serviceId = req.params.serviceId;
    const service = await garageService.getServiceByIdFromDB(userId, serviceId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Service details',
        data: service,
    });
});

const updateService = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const serviceId = req.params.serviceId;
    const data = req.body;
    const result = await garageService.updateServiceIntoDB(userId, serviceId, data);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Service updated successfully',
        data: result,
    });
}); 

const deleteService = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const garageId = req.params.garageId;
    const serviceId = req.params.serviceId;
    const result = await garageService.deleteServiceFromDB(
      userId,
      garageId, 
      serviceId,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Service deleted successfully',
        data: result,
    });
});


export const garageController = {
    registerGarage,
    getGarageList,
    getGarageById,
    updateGarage,
    deleteGarage,
    addService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
};