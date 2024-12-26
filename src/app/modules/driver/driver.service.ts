import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import { UserRoleEnum } from '@prisma/client';


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
      bookingStatus: 'PENDING',
    },
    select: {
      id: true,
      bookingTime: true,
      bookingStatus: true,
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
      service: {
        select: {
          serviceName: true,
          serviceImage: true,
          duration: true,
        },
      },
    },
  });

  


  const completedBookings = await prisma.bookings.findMany({
    where: {
      driverId: userId,
      bookingStatus: 'COMPLETED',
    },
    select: {
      id: true,
      bookingTime: true,
      bookingStatus: true,
      serviceStatus: true,
      serviceType: true,
      serviceId: true,
      carName: true,
      ownerNumber: true,
      location: true,
      totalAmount: true,
      paymentStatus: true,
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
      const dist = distance(latitude, longitude, booking.latitude, booking.longitude);
      const time = estimateTime(dist);
      return { ...booking, distance: `${dist.toFixed(2)} km`, time };
    }
    return { ...booking, distance: null };
  });

  return { 
    pendingBookings: pendingBookingsWithDistance, 
    completedBookings 
  };
};

const getBookingByIdFromDB = async (userId: string, bookingId: string) => {
  const driver = await prisma.bookings.findUnique({
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
      carName: true,
      ownerNumber: true,
      location: true,
      totalAmount: true,
      paymentStatus: true,
      service: {
        select: {
          serviceName: true,
        },
      },
    },
  });

  return driver;
};

const updateOnlineStatusIntoDB = async (
userId: string, data: { status: boolean; latitude: number; longitude: number; },
) => {
  try {
    const updatedDriver = await prisma.driver.update({
      where: {
        userId: userId,
      },
      data: {
        inOnline: data.status,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      },
    });
    return updatedDriver;
  } catch (error) {
    console.error('Error updating driver status:', error);
    throw error;
  }
};

const getDriverLiveLocation = async (driverId: string) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: driverId,
      },
      select: {
        latitude: true,
        longitude: true,
      },
    });
    return driver;
  } catch (error) {
    console.error('Error fetching driver location:', error);
    throw error;
  }
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
};
