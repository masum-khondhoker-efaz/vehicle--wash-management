import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import { BookingStatus, UserRoleEnum, UserStatus } from '@prisma/client';
import { setDefaultAutoSelectFamily } from 'net';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { notificationServices } from '../notification/notification.services';

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

const addDriverIntoDB = async (userId: string, driverData: any) => {
  const { data, driverImage } = driverData;

  const transaction = await prisma.$transaction(async prisma => {
    // Create the driver
    const createdDriver = await prisma.user.create({
      data: {
        fullName: data.fullName,
        profileImage: driverImage,
        email: data.email,
        password: await bcrypt.hash(data.password, 12),
        phoneNumber: data.phoneNumber,
        role: UserRoleEnum.DRIVER,
        status: UserStatus.ACTIVE,
      },
    });

    await prisma.driver.create({
      data: {
        userId: createdDriver.id,
        address: data.address,
        joinDate: data.joinDate,
        adminId: userId,
      },
    });

    return createdDriver;
  });

  return transaction;
};

const getDriverListFromDB = async (userId: string) => {
  const drivers = await prisma.driver.findMany({
    select: {
      userId: true,
      address: true,
      joinDate: true,
      user: {
        select: {
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  return drivers;
};

const getDriverByIdFromDB = async (driverId: string) => {
  const driver = await prisma.driver.findUnique({
    where: {
      userId: driverId,
    },
    select: {
      userId: true,
      address: true,
      joinDate: true,
      user: {
        select: {
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  return driver;
};

const updateDriverIntoDB = async (
  userId: string,
  driverId: string,
  driverData: any,
) => {
  const transaction = await prisma.$transaction(async prisma => {
    // Update the driver
    const updatedDriver = await prisma.user.update({
      where: {
        id: driverId,
      },
      data: {
        fullName: driverData.fullName,
        profileImage: driverData.driverImage,
        email: driverData.email,
        phoneNumber: driverData.phoneNumber,
      },
    });

    const updateData = await prisma.driver.update({
      where: {
        userId: driverId,
      },
      data: {
        address: driverData.address,
        joinDate: driverData.joinDate,
      },
      select: {
        userId: true,
        address: true,
        joinDate: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return updateData;
  });

  return transaction;
};

const deleteDriverFromDB = async (userId: string, driverId: string) => {
  const transaction = await prisma.$transaction(async prisma => {
    console.log(driverId, userId);
    const deletedDriver = await prisma.driver.delete({
      where: {
        userId: driverId,
      },
    });
    await prisma.user.delete({
      where: {
        id: driverId,
      },
    });

    return deletedDriver;
  });

  return transaction;
};

const getBookingsFromDB = async (
  userId: string,
  latitude: number,
  longitude: number,
) => {
  const pendingBookings = await prisma.bookings.findMany({
    where: {
      driverId: userId,
      bookingStatus: BookingStatus.IN_PROGRESS,
    },
    select: {
      id: true,
      bookingTime: true,
      bookingStatus: true,
      customerId: true,
      serviceStatus: true,
      serviceType: true,
      serviceId: true,
      carName: true,
      ownerNumber: true,
      location: true,
      latitude: true,
      longitude: true,
      totalAmount: true,
      paymentStatus: true,
      driverId: true,
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
        },
      },
      driver: {
        select: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  const completedBookings = await prisma.bookings.findMany({
    where: {
      driverId: userId,
      bookingStatus: BookingStatus.COMPLETED,
    },
    select: {
      id: true,
      bookingTime: true,
      customerId: true,
      bookingStatus: true,
      serviceStatus: true,
      serviceType: true,
      serviceId: true,
      carName: true,
      ownerNumber: true,
      location: true,
      totalAmount: true,
      paymentStatus: true,
      driverId: true,
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
        },
      },
    },
  });

  const pendingBookingsWithDistance = pendingBookings.map(booking => {
    if (booking.latitude !== null && booking.longitude !== null) {
      const dist = distance(
        latitude,
        longitude,
        booking.latitude,
        booking.longitude,
      );
      const time = estimateTime(dist);
      return { ...booking, distance: `${dist.toFixed(2)} km`, time };
    }
    return { ...booking, distance: null };
  });

  return {
    pendingBookings: pendingBookingsWithDistance,
    completedBookings,
  };
};

const getBookingByIdFromDB = async (userId: string, bookingId: string) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      driverId: userId,
      id: bookingId,
    },
    select: {
      id: true,
      bookingTime: true,
      bookingStatus: true,
      serviceStatus: true,
      serviceType: true,
      serviceId: true,
      specificInstruction: true,
      carName: true,
      ownerNumber: true,
      location: true,
      latitude: true,
      longitude: true,
      totalAmount: true,
      paymentStatus: true,
      customer: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
        },
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
          smallCarPrice: true,
          largeCarPrice: true,
        },
      },
      driver: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  const driverLocation = await prisma.driver.findFirst({
    where: {
      userId: userId,
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
      driverLocation.latitude ? driverLocation.latitude : 0,
      driverLocation.longitude ? driverLocation.longitude : 0,
      booking.latitude,
      booking.longitude,
    );
    const time = estimateTime(dist);
    return { ...booking, distance: `${dist.toFixed(2)} km`, time };
  }
};

const updateOnlineStatusIntoDB = async (
  userId: string,
  data: { inOnline: boolean; latitude: number; longitude: number },
) => {
  console.log(data);
  const updatedDriver = await prisma.driver.update({
    where: {
      userId: userId,
    },
    data: {
      inOnline: data.inOnline,
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    },
  });
  return updatedDriver;
};

const getDriverLiveLocation = async (driverId: string) => {
  const driver = await prisma.driver.findUnique({
    where: {
      userId: driverId,
    },
    select: {
      latitude: true,
      longitude: true,
    },
  });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  return driver;
};

const updateBookingStatusIntoDB = async (
  userId: string,
  bookingId: string,
  data: any,
) => {
  const updatedBooking = await prisma.bookings.update({
    where: {
      id: bookingId,
      driverId: userId,
    },
    data: {
      bookingStatus: data.bookingStatus as BookingStatus,
    },
  });

  const notification = {
    title: 'Your Booking is completed',
    body: `Your recent booking just completed in ${data.location} on ${data.serviceDate} .`,
  };

  const notification2 = {
    title: 'Driver is on the way',
    body: `Driver is on the way to complete your service ${data.location} on ${data.serviceDate} .`,
  };

  // if (fcmToken?.fcmToken) {
  if (data.bookingStatus === BookingStatus.COMPLETED) {
    const sendNotification = await notificationServices.sendSingleNotification(
      data.customerId,
      notification,
  );

    if (!sendNotification) {
      throw new AppError(httpStatus.CONFLICT, 'Failed to send notification');
    }
  }

  if(data.bookingStatus === BookingStatus.IN_PROGRESS){
    const sendNotification = await notificationServices.sendSingleNotification(
      data.customerId,
      notification2,
  );

  if (!sendNotification) {
    throw new AppError(httpStatus.CONFLICT, 'Failed to send notification');
  }
}

  return updatedBooking;
};

const addUserFeedbackIntoDB = async (userId: string, data: any) => {
  const feedback = await prisma.driverFeedback.create({
    data: {
      driverId: userId,
      bookingId: data.bookingId,
      customerId: data.customerId,
      title: data.title,
      feedback: data.feedback,
    },
  });

  if (!feedback) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to add feedback',
    );
  }

  return feedback;
};

const getFeedbackFromDB = async (userId: string) => {
  const feedback = await prisma.driverFeedback.findMany({
    where: {
      driverId: userId,
    },
  });

  return feedback;
};

export const driverService = {
  addDriverIntoDB,
  getDriverListFromDB,
  getDriverByIdFromDB,
  updateDriverIntoDB,
  deleteDriverFromDB,
  getBookingsFromDB,
  getBookingByIdFromDB,
  updateOnlineStatusIntoDB,
  getDriverLiveLocation,
  updateBookingStatusIntoDB,
  addUserFeedbackIntoDB,
  getFeedbackFromDB,
};
