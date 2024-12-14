import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRoleEnum } from '@prisma/client';
import { adminController } from './admin.controller';

const router = express.Router();

// Get all users
router.get(
  '/users',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
   adminController.getUserList,
);

//get all bookings
router.get(
  '/bookings',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.getBookingList,
);

// get all garages
router.get(
  '/garages',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.getGarageList,
);

// delete garage
router.delete(
  '/garages/:garageId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.deleteGarage,
);

export const AdminRoutes = router;