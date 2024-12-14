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

export const adminController = {
  getUserList,
  getBookingList,
  getGarageList,
  deleteGarage,
};