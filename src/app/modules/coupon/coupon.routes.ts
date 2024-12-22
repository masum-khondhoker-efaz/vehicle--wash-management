import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRoleEnum } from '@prisma/client';
import { couponValidation } from './coupon.validation';
import { couponController } from './coupon.controller';

const router = express.Router();

router.post(
    '/',
    validateRequest(couponValidation.couponValidationSchema),
    auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
    couponController.addCoupon,
)

router.get(
    '/',
    auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
    couponController.getCouponList,
);

router.get(
    '/:couponId',
    auth(),
    couponController.getCouponById,
);

router.put(
  '/:couponId',
  validateRequest(couponValidation.updateCouponValidationSchema),
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  couponController.updateCoupon,
);

router.delete(
  '/:couponId',
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  couponController.deleteCoupon,
);

router.post(
  '/apply-promo-code',
  validateRequest(couponValidation.applyPromoCodeSchema),
  auth(UserRoleEnum.CUSTOMER),
  couponController.applyPromoCode,
);

export const CouponRoutes = router;

