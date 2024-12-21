import prisma from '../../utils/prisma';

const addCouponIntoDB = async (userId: string, couponData: any) => {
  const coupon = await prisma.coupon.create({
    data: {
      ...couponData
    },
  });
  if (!coupon) {
    throw new Error('Coupon not created');
  }

  return coupon;
};

const getCouponListFromDB = async () => {
  const coupons = await prisma.coupon.findMany();
  if (!coupons) {
    throw new Error('Coupons not found');
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
    throw new Error('Coupon not found');
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
      ...couponData    
    },
  });
  if (!coupon) {
    throw new Error('Coupon not updated');
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
    throw new Error('Coupon not deleted');
  }

  return coupon;
};

export const couponService = {
  addCouponIntoDB,
  getCouponListFromDB,
  getCouponByIdFromDB,
  updateCouponIntoDB,
  deleteCouponFromDB,
};
