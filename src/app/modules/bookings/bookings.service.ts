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


const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const estimateTime = (distance: number, speed: number = 40) => {
  // speed is in km/h, default is 40 km/h
  const time = distance / speed; // time in hours
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return { hours, minutes };
};

const addBookingIntoDB = async (userId: string, bookingData: any) => {
  const transaction = await prisma.$transaction(async prisma => {
    const createdBooking = await prisma.bookings.create({
      data: {
      customerId: userId,
      ownerNumber: bookingData.ownerNumber,
      carName: bookingData.carName,
      location: bookingData.location,
      latitude: bookingData.latitude ? bookingData.latitude : null,
      longitude: bookingData.longitude ? bookingData.longitude : null,
      specificInstruction: bookingData.specificInstruction ? bookingData.specificInstruction : null,
      serviceStatus: ServiceStatus.IN_PROGRESS,
      serviceType: bookingData.serviceType,
      serviceDate: new Date(bookingData.serviceDate), 
      bookingTime: bookingData.bookingTime, 
      bookingStatus: BookingStatus.PENDING,
      totalAmount: bookingData.totalAmount,
      serviceId: bookingData.serviceId,
      paymentStatus: PaymentStatus.PENDING,
      couponCode: bookingData.couponCode ? bookingData.couponCode : null,
      },
    });

    if (!createdBooking) {
      throw new AppError(httpStatus.CONFLICT, 'Booking is not created');
    }
    if (bookingData.couponCode) {
      const couponUsed = await prisma.couponUsage.create({
        data: {
          couponCode: bookingData.couponCode,
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
  const booking = await prisma.bookings.findUnique({
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
      specificInstruction: true,
      serviceStatus: true,
      serviceId: true,
      paymentStatus: true,
      createdAt: true,
      updatedAt: true,
      driverId: true,
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
          smallCarPrice: true,
          largeCarPrice: true,
        },
      },
    }
  });
  

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  const driverLocation = await prisma.driver.findUnique({
    where: {
      userId: booking.driverId ? booking.driverId : '',
    },
    select: {
      latitude: true,
      longitude: true,
    },
  });
  if (!driverLocation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  
  if (booking.latitude !== null && booking.longitude !== null) {
    const dist = distance(
      driverLocation.latitude? driverLocation.latitude : 0,
      driverLocation.longitude? driverLocation.longitude : 0,
      booking.latitude,
      booking.longitude,
    );
    const time = estimateTime(dist);
    return { ...booking, distance: `${dist.toFixed(2)} km`, time };
  }

  
};


const getBookingListFromDB = async (userId: string) => {
  const pendingBookings = await prisma.bookings.findMany({
    where: {
      customerId: userId,
      bookingStatus: { in: [BookingStatus.IN_PROGRESS, BookingStatus.IN_ROUTE, BookingStatus.PENDING] },
      paymentStatus: PaymentStatus.COMPLETED,
    },
    include: {
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
          smallCarPrice: true,
          largeCarPrice: true,
        },
      },
    },
    orderBy: {
      serviceDate: 'desc',
    },
  });

  const completedBookings = await prisma.bookings.findMany({
    where: {
      customerId: userId,
      bookingStatus: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
    include: {
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
          smallCarPrice: true,
          largeCarPrice: true,
        },
      },
    },
    orderBy: {
      serviceDate: 'desc',
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
          serviceImage: true,
          duration: true,
          smallCarPrice: true,
          largeCarPrice: true,
        },
      },
    },
    orderBy: {
      serviceDate: 'desc',
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
      ...(data.specificInstruction && {
        specificInstruction: data.specificInstruction,
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
      }),
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
