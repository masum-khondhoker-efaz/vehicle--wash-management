import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';
import { uploadFileToSpace } from '../../utils/multerUpload';

const registerUser = catchAsync(async (req, res) => {
  const result = await UserServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: result,
  });
});


const socialLogin = catchAsync(async (req, res) => {
  const result = await UserServices.socialLoginIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result,
  });
});
const getAllUsers = catchAsync(async (req, res) => {
  // Extract the search term from the query parameters
  const searchTerm = req.query.searchTerm
    ? String(req.query.searchTerm)
    : undefined;

  // Call the service with the optional search term
  const result = await UserServices.getAllUsersFromDB(searchTerm);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.getMyProfileFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateProfileImage = catchAsync(async (req, res) => {
  const user = req.user as any;
  const file = req.file;

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, 'file not found');
  }
  let fileUrl = '';
  if (file) {
    fileUrl = await uploadFileToSpace(file, 'retire-professional');
  }
  const result = await UserServices.updateProfileImageIntoDB(user.id, fileUrl);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile image updated successfully',
    data: result,
  });
});

const getUserDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserDetailsFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User details retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.updateMyProfileIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateUserRoleStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateUserRoleStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserServices.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await UserServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Please check your email to get the otp!',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const result = await UserServices.verifyOtpInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully!',
    data: result,
  });
});

const updatePassword = catchAsync(async (req, res) => {
  const result = await UserServices.updatePassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const verifyOtpForgotPassword = catchAsync(async (req, res) => {
  const result = await UserServices.verifyOtpForgotPasswordInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully!',
    data: result,
  });
});

export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  getUserDetails,
  updateMyProfile,
  updateUserRoleStatus,
  changePassword,
  forgotPassword,
  verifyOtp,
  updatePassword,
  verifyOtpForgotPassword,
  updateProfileImage,
  socialLogin,
};
