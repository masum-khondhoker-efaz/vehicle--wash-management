import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';
import exp from 'constants';
import { bookingService } from './bookings.service';

const addBooking = catchAsync(async (req, res) => {
  const user = req.user as any;
  const data = req.body;

  const result = await bookingService.addBookingIntoDB(user.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking added successfully',
    data: result,
  });
});

const getBookingList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const bookings = await bookingService.getBookingListFromDB(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking list',
    data: bookings,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const bookingId = req.params.bookingId;
  const booking = await bookingService.getBookingByIdFromDB(user.id, bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking details',
    data: booking,
  });
});

const updateBooking = catchAsync(async (req, res) => {
  const user = req.user as any;
  const bookingId = req.params.bookingId;
  const data = req.body;

  const result = await bookingService.updateBookingIntoDB(
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

const cancelBookingStatus = catchAsync(async (req, res) => {
    const user = req.user as any;
    const bookingId = req.params.bookingId;
    
    const result = await bookingService.cancelBookingIntoDB(user.id, bookingId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Booking cancelled successfully',
        data: result,
    });
});


const deleteBooking = catchAsync(async (req, res) => {
  const user = req.user as any;
  const bookingId = req.params.bookingId;

  const result = await bookingService.deleteBookingFromDB(user.id, bookingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking deleted successfully',
    data: result,
  });
});



export const bookingController = {
  addBooking,
  getBookingList,
  getBookingById,
  updateBooking,
  cancelBookingStatus,
  deleteBooking,
};
