import prisma from '../../utils/prisma';
import {
  BookingStatus,
  PaymentStatus,
  ServiceStatus,
  UserRoleEnum,
} from '@prisma/client';

const addBookingIntoDB = async (userId: string, bookingData: any) => {
  const transaction = await prisma.$transaction(async prisma => {
    const createdBooking = await prisma.bookings.create({
      data: {
        customerId: userId,
        ownerNumber: bookingData.ownerNumber,
        carName: bookingData.carName,
        location: bookingData.location,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        serviceStatus: ServiceStatus.IN_ROUTE,
        serviceDate: bookingData.serviceDate,
        bookingTime: bookingData.bookingTime,
        bookingStatus: BookingStatus.PENDING,
        totalAmount: bookingData.totalAmount,
        serviceId: bookingData.serviceId,
        paymentStatus: PaymentStatus.PENDING,
      },
    });
 
    return createdBooking;
  });

  return transaction;
};



const getBookingListFromDB = async (userId: string) => {
  const bookings = await prisma.bookings.findMany({
    where: {
      customerId: userId,
    },
  });

  return bookings;
};

const getBookingByIdFromDB = async (userId: string, bookingId: string) => {
  const bookings = await prisma.bookings.findMany({
    where: {
      id: bookingId,
      customerId: userId,
    },
    select: {
      id: true,
      serviceDate: true,
      bookingTime: true,
      bookingStatus: true,
      totalAmount: true,
      location: true,
      latitude: true,
      longitude: true,
      serviceStatus: true,
      serviceId: true,
      estimatedTime: true,
      createdAt: true,
      updatedAt: true,
    },
  });


    const services = await prisma.service.findFirst({
      where: {
        id:  bookings[0].serviceId,
      },
      select: {
        serviceName: true,
      },
    });

  

  return bookings;
};

const updateBookingIntoDB = async (
  userId: string,
  bookingId: string,
  data: any,
) => {
const updatedBooking = await prisma.bookings.update({
    where: {
        id: bookingId,
        customerId: userId,
    },
    data: {
        bookingTime: data.bookingTime,
        totalAmount: data.totalAmount,
        ownerNumber: data.ownerNumber,
        carName: data.carName,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,

    },
});

  return updatedBooking;
};


const cancelBookingIntoDB = async (userId: string, bookingId: string) => {
  const cancelledBooking = await prisma.bookings.update({
    where: {
      id: bookingId,
      customerId: userId,
    },
    data: {
      bookingStatus: BookingStatus.CANCELLED,
    },
  });

  return cancelledBooking;
};


const deleteBookingFromDB = async (userId: string, bookingId: string) => {
  const deletedBooking = await prisma.bookings.delete({
    where: {
      id: bookingId,
      customerId: userId,
      bookingStatus: BookingStatus.CANCELLED,
    },
  });
  return deletedBooking;
};

const applyPromoCodeIntoDB = async (
  userId: string,
  bookingId: string,
  promoCode: string,
) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId,
      customerId: userId,
    },
  });
  if (!booking) {
    throw new Error('Booking not found');
  }

  const promo = await prisma.coupon.findMany({
    where: {
      couponCode: promoCode,
    },
  });

  if (!promo) {
    throw new Error('Promo code not found');
  }

  const updatedBooking = await prisma.bookings.update({
    where: {
      id: bookingId,
    },
    data: {
      totalAmount:
        booking.totalAmount -
        (booking.totalAmount * (promo[0].percentage ?? 0)) / 100,
    },
  });

  return updatedBooking;
};


export const bookingService = {
  addBookingIntoDB,
  getBookingListFromDB,
  getBookingByIdFromDB,
  cancelBookingIntoDB,
  updateBookingIntoDB,
  deleteBookingFromDB,
  applyPromoCodeIntoDB,
};
