import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';
import exp from 'constants';
import { carService } from './car.service';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';

const addCar = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const file = req.file;

  if (!file) {
    throw new Error('file not found');
  }
  const fileUrl = await uploadFileToSpace(file, 'retire-professional');

  const carData = {
    data,
    carImage: fileUrl,
  };
  const result = await carService.addCarIntoDB(userId, carData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service deleted successfully',
    data: result,
  });
});

const getCarList = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const cars = await carService.getCarListFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Car list',
    data: cars,
  });
});

const getCarById = catchAsync(async (req, res) => {
  const carId = req.params.carId;
  const car = await carService.getCarByIdFromDB(carId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Car details',
    data: car,
  });
});

const updateCar = catchAsync(async (req, res) => {
  const carId = req.params.carId;
  const userId = req.user.id;
  const data = req.body;
  const file = req.file;

  let carData = { ...data };

  if (file) {
    const fileUrl = await uploadFileToSpaceForUpdate(
      file,
      'retire-professional',
    );
    carData.carImage = fileUrl;
  }

  const result = await carService.updateCarIntoDB(userId, carId, carData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Car updated successfully',
    data: result,
  });
});

const deleteCar = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const carId = req.params.carId;
  const result = await carService.deleteCarFromDB(userId, carId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Car deleted successfully',
    data: result,
  });
});

export const carController = {
  addCar,
  getCarList,
  getCarById,
  updateCar,
  deleteCar,
};
