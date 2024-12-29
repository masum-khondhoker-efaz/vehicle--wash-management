import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';
import { driverService } from './driver.service';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';
import AppError from '../../errors/AppError';

const addDriver = catchAsync(async (req, res) => {
  const user = req.user as any;
  const data = req.body;
  const file = req.file;

  if (!file) {
    throw new AppError(httpStatus.CONFLICT, 'file not found');
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

  const result = await driverService.updateDriverIntoDB(
    user.id,
    driverId,
    driverData,
  );

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

const getBookings = catchAsync(async (req, res) => {
  const user = req.user as any;
  const latitude = parseFloat(req.params.latitude);
  const longitude = parseFloat(req.params.longitude);
  const bookings = await driverService.getBookingsFromDB(
    user.id,
    latitude,
    longitude,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking list',
    data: bookings,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const bookingId = req.params.bookingId;
  const booking = await driverService.getBookingByIdFromDB(user.id, bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking details',
    data: booking,
  });
});

const updateOnlineStatus = catchAsync(async (req, res) => {
  const user = req.user as any;
  const data = req.body;
  const result = await driverService.updateOnlineStatusIntoDB(user.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Online status updated successfully',
    data: result,
  });
});

const getDriverLiveLocation = catchAsync(async (req, res) => {
  const driverId = req.params.driverId;
  const location = await driverService.getDriverLiveLocation(driverId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver live location retrieved successfully',
    data: location,
  });
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const user = req.user as any;
  const bookingId = req.params.bookingId;
  const data = req.body;

  const result = await driverService.updateBookingStatusIntoDB(
    user.id,
    bookingId,
    data,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking updated successfully',
    data: result,
  });
});

const addUserFeedback = catchAsync(async (req, res) => {
  const user = req.user as any;
  const data = req.body;
  const result = await driverService.addUserFeedbackIntoDB(user.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Feedback added successfully',
    data: result,
  });
});

const getFeedback = catchAsync(async (req, res) => {
    const user = req.user as any;
    const feedback = await driverService.getFeedbackFromDB(user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Feedback list',
        data: feedback,
    });
});

export const driverController = {
  addDriver,
  getDriverList,
  getDriverById,
  updateDriver,
  deleteDriver,
  getBookings,
  getBookingById,
  updateOnlineStatus,
  getDriverLiveLocation,
  updateBookingStatus,
  addUserFeedback,
  getFeedback,
};
