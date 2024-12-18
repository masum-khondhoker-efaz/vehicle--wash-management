import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from '../user/user.controller';
import { UserValidations } from '../user/user.validation';
import { UserRoleEnum } from '@prisma/client';
const router = express.Router();

router.post(
  '/register',
  validateRequest(UserValidations.registerUser),
  UserControllers.registerUser,
);

router.get(
  '/',
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  UserControllers.getAllUsers,
);

router.get('/me', auth(), UserControllers.getMyProfile);

router.get(
  '/:id',
  auth('ADMIN', 'SUPER_ADMIN'),
  UserControllers.getUserDetails,
);
router.put(
  '/update-profile',
  auth(),
  UserControllers.updateMyProfile,
);

router.put(
  '/update-user/:id',
  validateRequest(UserValidations.updateProfileSchema),
  auth(),
  UserControllers.updateUserRoleStatus,
);

router.put(
  '/change-password',
  auth(),
  UserControllers.changePassword,
);

router.post(
  '/forgot-password',
  validateRequest(UserValidations.forgetPasswordSchema),
  UserControllers.forgotPassword,
);

router.put(
  '/verify-otp',
  validateRequest(UserValidations.verifyOtpSchema),
  UserControllers.verifyOtp,
);


router.put(
  '/update-password',
  
  UserControllers.updatePassword,
);
export const UserRouters = router;
