import { ServiceType } from '@prisma/client';
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
    throw new AppError(httpStatus.CONFLICT, 'Coupon not created');
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
    serviceType: string;
    couponId: string;
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
    throw new AppError(httpStatus.CONFLICT, 'Service not found');
  }

  // Find the promo code
  const promo = await prisma.coupon.findUnique({
    where: {
      id: promoCode.couponId,
      couponCode: promoCode.couponCode,
      expiryDate: {
        gte: new Date(),
      },
    },
  });

  // Check if the promo code exists
  if (!promo) {
    throw new AppError(httpStatus.CONFLICT, 'Promo code not found');
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
  if (promoCode.serviceType === ServiceType.PREMIUM) {
    if (service.servicePremiumPrice !== null) {
      servicePrice =
        service.servicePremiumPrice -
        (service.servicePremiumPrice * (promo.percentage ?? 0)) / 100;
    } else {
      throw new AppError(httpStatus.CONFLICT, 'Service premium price is null');
    }
  }

  if (promoCode.serviceType === ServiceType.NORMAL) {
    servicePrice =
      service.servicePrice -
      (service.servicePrice * (promo.percentage ?? 0)) / 100;
  }

  // Create a coupon usage entry
  // const couponUsed = await prisma.couponUsage.create({
  //   data: {
  //     couponId: promo.id,
  //     bookingId: bookingId,
  //     customerId: userId,
  //   },
  // });

  // if (!couponUsed) {
  //   throw new AppError(httpStatus.CONFLICT,'couponUsage is not created');
  // }

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
