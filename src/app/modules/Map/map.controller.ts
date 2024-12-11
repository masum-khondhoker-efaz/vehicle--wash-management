import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { MapServices } from './map.service';


// get companies
const getAllPlaces = catchAsync(async (req, res) => {
//   const user = req?.user as JwtPayload;
 const { latitude, longitude, garageName } = req.query;

  try {
    const result = await MapServices.getCompaniesFromDb(
      latitude ? parseFloat(latitude as string) : 0,
      longitude ? parseFloat(longitude as string) : 0,
      garageName ? String(garageName as string) : undefined,
    );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Garages retrieved successfully',
    data: result,
  });
}
catch (error) {
  sendResponse(res, {
    success: false,
    statusCode: httpStatus.BAD_REQUEST,
    message: (error as Error).message,
    data: {},
    });
  }
});


const getDistanceFromGarage = catchAsync(async (req, res) => {
  const { latitude, longitude, garageId } = req.body;

  try {
    const result = await MapServices.getDistanceFromGarageFromDb(
      latitude ? parseFloat(latitude as string) : 0,
      longitude ? parseFloat(longitude as string) : 0,
      garageId, 
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Distance retrieved successfully',
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: (error as Error).message,
      data: {},
    });
  }
});

export const MapController = {
  getAllPlaces,
  getDistanceFromGarage,
};