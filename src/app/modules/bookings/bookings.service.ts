import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import {
  BookingStatus,
  PaymentStatus,
  ServiceStatus,
  ServiceType,
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
        latitude: bookingData.latitude? bookingData.latitude : null,
        longitude: bookingData.longitude? bookingData.longitude : null,
        serviceStatus: ServiceStatus.IN_PROGRESS,
        serviceType: bookingData.serviceType,
        serviceDate: bookingData.serviceDate,
        bookingTime: bookingData.bookingTime,
        bookingStatus: BookingStatus.PENDING,
        totalAmount: bookingData.totalAmount,
        serviceId: bookingData.serviceId,
        paymentStatus: PaymentStatus.PENDING,
        couponId: bookingData.couponId ? bookingData.couponId : null,
      },
    });

    if (!createdBooking) {
      throw new AppError(httpStatus.CONFLICT, 'Booking not created');
    }
    if (bookingData.couponId) {
      const couponUsed = await prisma.couponUsage.create({
        data: {
          couponId: bookingData.couponId,
          bookingId: createdBooking.id,
          customerId: userId,
        },
      });

      if (!couponUsed) {
        throw new AppError(httpStatus.CONFLICT, 'couponUsage is not created');
      }
    }
    return createdBooking;
  });

  return transaction;
};

// const getBookingListFromDB = async (userId: string) => {
//   const bookings = await prisma.bookings.findMany({
//     where: {
//       customerId: userId,
//     },
//   });

//   return bookings;
// };

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
      id: bookings[0].serviceId,
    },
    select: {
      serviceName: true,
    },
  });

  return bookings;
};


const getBookingListFromDB = async (userId: string) => {
  const pendingBookings = await prisma.bookings.findMany({
    where: {
      customerId: userId,
      bookingStatus: BookingStatus.PENDING,
    },
    include: {
      service: {
        select: {
          serviceName: true,
        },
      },
    },
  });

  const completedBookings = await prisma.bookings.findMany({
    where: {
      customerId: userId,
      bookingStatus: BookingStatus.COMPLETED,
    },
    include: {
      service: {
        select: {
          serviceName: true,
        },
      },
    },
  });

  const cancelledBookings = await prisma.bookings.findMany({
    where: {
      customerId: userId,
      bookingStatus: BookingStatus.CANCELLED,
    },
    include: {
      service: {
        select: {
          serviceName: true,
        },
      },
    },
  });

  return {
    pendingBookings,
    completedBookings,
    cancelledBookings,
  };
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
      ...(data.bookingTime && { bookingTime: data.bookingTime }),
      ...(data.totalAmount && { totalAmount: data.totalAmount }),
      ...(data.ownerNumber && { ownerNumber: data.ownerNumber }),
      ...(data.carName && { carName: data.carName }),
      ...(data.location && { location: data.location }),
      ...(data.latitude && { latitude: data.latitude }),
      ...(data.longitude && { longitude: data.longitude }),
      ...(data.bookingStatus && { bookingStatus: data.bookingStatus }),
      ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
      ...(data.serviceStatus && { serviceStatus: data.serviceStatus }),
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

export const bookingService = {
  addBookingIntoDB,
  getBookingListFromDB,
  getBookingByIdFromDB,
  cancelBookingIntoDB,
  updateBookingIntoDB,
  deleteBookingFromDB,
};
