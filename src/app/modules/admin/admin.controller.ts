import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import prisma from '../../utils/prisma';
import { adminService } from './admin.service';

// get all users
const getUserList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const page = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
  const offset = (page - 1) * limit;

  const result = await adminService.getUserList(offset, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User list',
    data: result,
  });
});

//change user status
const changeUserStatus = catchAsync(async (req, res) => {
  const userId = req.params.userId as string;
  const status = req.params.status as string;

  const result = await adminService.changeUserStatusIntoDB(userId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User status updated successfully',
    data: result,
  });
});


// assign driver
const assignDriver = catchAsync(async (req, res) => {
  const driverId = req.params.driverId as string;
  const bookingId = req.params.bookingId as string;
  const result = await adminService.assignDriverIntoDB(driverId, bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver assigned successfully',
    data: result,
  });
});


// get all drivers
const getDriverList = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const result = await adminService.getDriverList(offset, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver list',
    data: result,
  });
});


//service status change
const changeServiceStatus = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId as string;
  const status = req.params.status as string;

  const result = await adminService.changeServiceStatusIntoDB(serviceId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service status updated successfully',
    data: result,
  });
});


// get all bookings
const getBookingList = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const result = await adminService.getBookingList(offset, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking list',
    data: result,
  });
});

// get all services
const getServiceList = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const result = await adminService.getServiceListFromDB(offset, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service list',
    data: result,
  });
});


// get payment in total
const getPayment = catchAsync(async (req, res) => {
  const result = await adminService.getPaymentFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Total payment',
    data: result,
  });
});

// get all garages
const getGarageList = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const result = await adminService.getGarageList(offset, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Garage list',
    data: result,
  });
});


// delete garage
const deleteGarage = catchAsync(async (req, res) => {
  const  garageId  = req.params.garageId as string;
  const result = await adminService.deleteGarage(garageId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Garage deleted successfully',
    data: result,
  });
});

const addOffer = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await adminService.addOfferIntoDB(data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Offer added successfully',
    data: result,
  });
});

const getOfferList = catchAsync(async (req, res) => {
 
  const result = await adminService.getOfferListFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Offer list retrieved successfully',
    data: result,
  });
});


const getDriverLiveLocation = catchAsync(async (req, res) => {
  const driverId = req.params.driverId;
  const location = await adminService.getDriverLiveLocation(driverId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver live location retrieved successfully',
    data: location,
  });
});


export const adminController = {
  getUserList,
  getBookingList,
  getGarageList,
  deleteGarage,
  changeUserStatus,
  getDriverList,
  assignDriver,
  getServiceList,
  changeServiceStatus,
  getPayment,
  addOffer,
  getOfferList,
  getDriverLiveLocation,
};