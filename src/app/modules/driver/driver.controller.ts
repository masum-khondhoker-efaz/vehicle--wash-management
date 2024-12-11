import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';
import { driverService } from './driver.service';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';


const addDriver = catchAsync(async (req, res) => {
    const user = req.user as any;
    const data = req.body;
    const file = req.file;

     if (!file) {
      throw new Error('file not found');
    }
    const fileUrl = await uploadFileToSpace(file, 'retire-professional');

    const driverData = {
      data,
      driverImage: fileUrl,
    };

    const result = await driverService.addDriverIntoDB(user.id, driverData);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Driver registered successfully',
        data: result,
    });
});

const getDriverList = catchAsync(async (req, res) => {
    const user = req.user as any;
    const drivers = await driverService.getDriverListFromDB(user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Driver list',
        data: drivers,
    });
});

const getDriverById = catchAsync(async (req, res) => {
    const driverId = req.params.driverId;
    const driver = await driverService.getDriverByIdFromDB(driverId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Driver details',
        data: driver,
    });
});

const updateDriver = catchAsync(async (req, res) => {
    const driverId = req.params.driverId;
    const user = req.user as any;
    const data = req.body;
    const file = req.file;

    let driverData = { ...data };

    if (file) {
      const fileUrl = await uploadFileToSpaceForUpdate(
        file,
        'retire-professional',
      );
      driverData.driverImage = fileUrl;
    }

    const result = await driverService.updateDriverIntoDB(user.id, driverId,  driverData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Driver updated successfully',
        data: result,
    });
});

const deleteDriver = catchAsync(async (req, res) => {
    const driverId = req.params.driverId;
    const user = req.user as any;

    const result = await driverService.deleteDriverFromDB(user.id, driverId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Driver deleted successfully',
        data: result,
    });
});

export const driverController = {
    addDriver,
    getDriverList,
    getDriverById,
    updateDriver,
    deleteDriver,
};
