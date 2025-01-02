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

// change user status
router.patch(
  '/users/:userId/:status',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.changeUserStatus,
);

// get all drivers
router.get(
  '/drivers',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.getDriverList,
);

// assign driver
router.patch(
  '/drivers/:driverId/:bookingId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.assignDriver,
);

// change booking status
// router.patch(
//   '/bookings/:bookingId',
//   auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
//   adminController.changeBookingStatus,
// );


//get all bookings
router.get(
  '/bookings',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.getBookingList,
);

router.post(
  '/car-model',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.carModelAdd,
);

router.get(
  '/car-model',
  auth(),
  adminController.carModelList,
);

router.put(
  '/car-model/:carModelId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.carModelUpdate,
);

router.delete(
  '/car-model/:carModelId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.carModelDelete,
);

// get all services
router.get(
  '/services',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.getServiceList,
);

//service status change
router.patch(
  '/services/:serviceId/:status',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.changeServiceStatus,
);

// get payment in total
router.get(
  '/payment',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.getPayment,
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

// add offer
router.post(
  '/offers',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.addOffer
);

// get all offers
router.get(
  '/offers',
  auth(),
  adminController.getOfferList
);

router.get(
  '/live-location/:driverId',
  auth(UserRoleEnum.ADMIN),
  adminController.getDriverLiveLocation,
);

router.get(
  '/get-feedback',
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  adminController.getFeedback,
);


router.post(
  '/add-privacy-policy',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  adminController.addPrivacyPolicy,
);

router.get(
  '/get-privacy-policy',
  auth(),
  adminController.getPrivacyPolicy,
);

export const AdminRoutes = router;