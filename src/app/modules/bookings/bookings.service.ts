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
        garageId: bookingData.garageId,
        customerId: userId,
        ownerNumber: bookingData.ownerNumber,
        carName: bookingData.carName,
        carId: bookingData.carId,
        location: bookingData.location,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        serviceStatus: ServiceStatus.IN_ROUTE,
        bookingTime: bookingData.bookingTime,
        bookingStatus: BookingStatus.PENDING,
        totalAmount: bookingData.totalAmount,
        serviceIds: bookingData.serviceIds,
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
      garageId: true,
      serviceDate: true,
      bookingTime: true,
      carId: true,
      bookingStatus: true,
      totalAmount: true,
      location: true,
      latitude: true,
      longitude: true,
      serviceStatus: true,
      serviceIds: true,
      estimatedTime: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  for (const booking of bookings) {
    const car = await prisma.car.findUnique({
      where: {
        id: booking.carId,
      },
      select: {
        driverId: true,
      },
    });

    const driver = await prisma.user.findUnique({
      where: {
        id: car?.driverId,
      },
      select: {
        fullName: true,
        profileImage: true,
      },
    });

    (booking as any).driverName = driver?.fullName;
    (booking as any).driverImage = driver?.profileImage;

    const services = await prisma.service.findMany({
      where: {
        id: {
          in: booking.serviceIds,
        },
      },
      select: {
        serviceName: true,
      },
    });

    (booking as any).serviceNames = services.map(
      service => service.serviceName,
    );
  }

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
        serviceIds: data.serviceIds,
        totalAmount: data.totalAmount,
        ownerNumber: data.ownerNumber,
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
