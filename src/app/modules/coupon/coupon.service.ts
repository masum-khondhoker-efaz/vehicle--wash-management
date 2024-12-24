import { CarType, ServiceType } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const addCouponIntoDB = async (userId: string, couponData: any) => {
  const coupon = await prisma.coupon.create({
    data: {
      ...couponData,
    },
  });
  if (!coupon) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Coupon not created');
  }

  return coupon;
};

const getCouponListFromDB = async () => {
  const coupons = await prisma.coupon.findMany();
  if (!coupons) {
    throw new AppError(httpStatus.CONFLICT, 'Coupons not found');
  }

  return coupons;
};

const getCouponByIdFromDB = async (couponId: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },
  });
  if (!coupon) {
    throw new AppError(httpStatus.CONFLICT, 'Coupon not found');
  }

  return coupon;
};

const updateCouponIntoDB = async (
  userId: string,
  couponId: string,
  couponData: any,
) => {
  const coupon = await prisma.coupon.update({
    where: {
      id: couponId,
    },
    data: {
      ...couponData,
    },
  });
  if (!coupon) {
    throw new AppError(httpStatus.CONFLICT, 'Coupon not updated');
  }

  return coupon;
};

const deleteCouponFromDB = async (couponId: string) => {
  const coupon = await prisma.coupon.delete({
    where: {
      id: couponId,
    },
  });
  if (!coupon) {
    throw new AppError(httpStatus.CONFLICT, 'Coupon not deleted');
  }

  return coupon;
};

const applyPromoCodeIntoDB = async (
  userId: string,
  promoCode: {
    serviceId: string;
    carType: CarType;
    couponCode: string;
  },
) => {
  // Check if the booking exists for the given user
  const service = await prisma.service.findUnique({
    where: {
      id: promoCode.serviceId,
    },
  });
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  // Find the promo code
  const promo = await prisma.coupon.findUnique({
    where: {
      couponCode: promoCode.couponCode,
      expiryDate: {
        gte: new Date(),
      },
    },
  });

  // Check if the promo code exists
  if (!promo) {
    throw new AppError(httpStatus.NOT_FOUND, 'Promo code not found');
  }
  // Optional: Validate promo code expiry date

  const couponUsage = await prisma.couponUsage.findFirst({
    where: {
      couponId: promo.id,
    },
  });

  if (couponUsage) {
    throw new AppError(httpStatus.CONFLICT, 'Promo code has already been used');
  }

  let servicePrice;
  // Update the booking with the discounted amount
  if (promoCode.carType === CarType.SMALL) {
    if (service.smallCarPrice !== null) {
      servicePrice =
        service.smallCarPrice -
        (service.smallCarPrice * (promo.percentage ?? 0)) / 100;
    } else {
      throw new AppError(httpStatus.CONFLICT, 'Service premium price is null');
    } 
  }

  if (promoCode.carType === CarType.LARGE) {
    if (service.largeCarPrice !== null) {
      servicePrice =
        service.largeCarPrice -
        (service.largeCarPrice * (promo.percentage ?? 0)) / 100;
    } else {
      throw new AppError(httpStatus.CONFLICT, 'Service basic price is null');
    }
  }

  // Create a coupon usage entry
  const couponUsed = await prisma.couponUsage.create({
    data: {
      couponId: promo.id,
      customerId: userId,
    },
  });

  if (!couponUsed) {
    throw new AppError(httpStatus.CONFLICT,'couponUsage is not created');
  }

  return { Total_price: servicePrice };
};

export const couponService = {
  addCouponIntoDB,
  getCouponListFromDB,
  getCouponByIdFromDB,
  updateCouponIntoDB,
  deleteCouponFromDB,
  applyPromoCodeIntoDB,
};
