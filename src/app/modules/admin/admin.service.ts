import { join } from 'path';
import catchAsync from '../../utils/catchAsync';
import prisma from '../../utils/prisma';
import {
  BookingStatus,
  PaymentStatus,
  ServiceActiveStatus,
  ServiceStatus,
  UserRoleEnum,
  UserStatus,
} from '@prisma/client';
import { profile } from 'console';
import { notificationServices } from '../notification/notification.services';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

// get all users
const getUserList = async (offset: number, limit: number) => {
  // Fetch paginated user data with location
  const customers = await prisma.user.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    where: {
      role: UserRoleEnum.CUSTOMER,
    },
    select: {
      customer: {
        select: {
          location: true,
        },
      },
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      status: true,
      role: true,
    },
  });
  // Fetch booking details where paymentStatus is Completed
  const completedBookings = await prisma.bookings.findMany({
    where: {
      paymentStatus: PaymentStatus.COMPLETED,
    },
    select: {
      id: true,
      paymentStatus: true,
      customerId: true,
    },
  });

  // Flatten the customer data to include location directly
  const formattedCustomers = customers.map(customer => ({
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    location: customer.customer?.[0]?.location ?? null,
    profileImage: customer.profileImage,
    status: customer.status,
    totalBookings: completedBookings.filter(
      booking => booking.customerId === customer.id,
    ).length,
    role: customer.role,
  }));

  // Get the total count of customers with the role of 'CUSTOMER'
  const totalCount = await prisma.user.count({
    where: {
      role: UserRoleEnum.CUSTOMER,
    },
  });

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / limit);

  // Return pagination info along with data
  return {
    currentPage: Math.floor(offset / limit) + 1, // Current page is calculated by dividing offset by limit
    totalPages,
    totalUser: totalCount, // Total number of users
    customers: formattedCustomers,
  };
};

// change user status
const changeUserStatusIntoDB = async (userId: string, status: string) => {
  // Update the user status
  const data = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: status as UserStatus,
    },
  });

  return data;
};

//assign driver
const assignDriverIntoDB = async (driverId: string, bookingId: string) => {
  // Update the user status
  const data = await prisma.bookings.update({
    where: {
      id: bookingId,
      bookingStatus: BookingStatus.PENDING,
    },
    data: {
      driverId: driverId,
      bookingStatus: BookingStatus.IN_PROGRESS,
    },
  });

  const notification = {
    title: 'New Booking Assigned',
    body: `You have assigned to a new booking in ${data.location} at ${data.bookingTime} on ${data.serviceDate} .`,
  };

  // if (fcmToken?.fcmToken) {
  if (data.driverId) {
    const sendNotification = await notificationServices.sendSingleNotification(
      driverId,
      notification,
    );

    if (!sendNotification) {
      throw new AppError(httpStatus.CONFLICT, 'Failed to send notification');
    }
  }
  return data;
};

// get all drivers
const getDriverList = async (offset: number, limit: number) => {
  // Get the drivers with pagination
  const drivers = await prisma.user.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    where: {
      role: UserRoleEnum.DRIVER,
    },
    select: {
      driver: {
        select: {
          joinDate: true,
        },
      },
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      status: true,
      role: true,
    },
  });

  const bookings = await prisma.bookings.findMany({
    where: {
      paymentStatus: ServiceStatus.COMPLETED,
    },
    select: {
      id: true,
      serviceStatus: true,
      driverId: true,
    },
  });

  // Get the total count of drivers with the role of 'DRIVER'
  const totalDrivers = await prisma.user.count({
    where: {
      role: UserRoleEnum.DRIVER,
    },
  });

  const formattedDrivers = drivers.map(driver => ({
    id: driver.id,
    fullName: driver.fullName,
    email: driver.email,
    phoneNumber: driver.phoneNumber,
    joinDate: driver.driver?.[0]?.joinDate ?? null,
    profileImage: driver.profileImage,
    status: driver.status,
    role: driver.role,
    totalBookingsCompleted: bookings.filter(
      booking => booking.driverId === driver.id,
    ).length,
  }));

  // Get the total number of pages
  const totalPages = Math.ceil(totalDrivers / limit);

  return {
    totalDrivers,
    totalPages,
    formattedDrivers,
  };
};

//service status change
const changeServiceStatusIntoDB = async (serviceId: string, status: string) => {
  // Update the service status
  const data = await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: {
      serviceStatus: status as ServiceActiveStatus,
    },
  });

  return data;
};

// change driver status
const changeDriverStatusIntoDB = async (driverId: string, status: string) => {
  // Update the driver status
  const data = await prisma.user.update({
    where: {
      id: driverId,
    },
    data: {
      status: status as UserStatus,
    },
  });

  return data;
};
// get all bookings
const getBookingList = async (
  offset: number,
  limit: number,
  bookingStatus?: BookingStatus[],
  paymentStatus?: PaymentStatus[],
) => {
  // Get the bookings with optional filters and pagination in descending order
  const bookings = await prisma.bookings.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    where: {
      ...(bookingStatus && {
        bookingStatus: {
          in: bookingStatus,
        },
      }),
      ...(paymentStatus && {
        paymentStatus: {
          in: paymentStatus,
        },
      }),
    },
    select: {
      id: true,
      bookingStatus: true,
      serviceDate: true,
      bookingTime: true,
      location: true,
      latitude: true,
      longitude: true,
      carName: true,
      ownerNumber: true,
      totalAmount: true,
      paymentStatus: true,
      customerId: true,
      createdAt: true,
      driverId: true,
      serviceId: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get the total count of pending bookings
  const totalPendingCount = await prisma.bookings.count({
    where: {
      bookingStatus: BookingStatus.IN_PROGRESS,
    },
  });

  // Fetch user details for each booking with selected fields
  const bookingDetailsWithUser = await Promise.all(
    bookings.map(async booking => {
      const user = await prisma.user.findUnique({
        where: {
          id: booking.customerId,
        },
        select: {
          fullName: true,
          email: true,
          profileImage: true,
          phoneNumber: true,
          customer: {
            select: {
              location: true,
              latitude: true,
              longitude: true,
            }
          },
        },
      });

      const driver = booking.driverId
        ? await prisma.user.findUnique({
            where: {
              id: booking.driverId,
            },
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          })
        : null;

      const service = booking.serviceId
        ? await prisma.service.findUnique({
            where: {
              id: booking.serviceId,
            },
            select: {
              serviceName: true,
              duration: true,
              largeCarPrice: true,
              smallCarPrice: true,
            },
          })
        : null;

      return {
        id: booking.id,
        bookingStatus: booking.bookingStatus,
        serviceDate: booking.serviceDate,
        bookingTime: booking.bookingTime,
        location: booking.location,
        latitude: booking.latitude,
        longitude: booking.longitude,
        carName: booking.carName,
        ownerNumber: booking.ownerNumber,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        user,
        driver,
        service,
      };
    }),
  );

  // Get the total count of cancelled bookings
  const totalCancelledCount = await prisma.bookings.count({
    where: {
      bookingStatus: BookingStatus.CANCELLED,
    },
  });

  // Calculate the total number of pages for both pending and cancelled bookings
  const totalPendingPages = Math.ceil(totalPendingCount / limit);
  const totalCancelledPages = Math.ceil(totalCancelledCount / limit);

  return {
    currentPage: Math.floor(offset / limit) + 1,
    total_pending_pages: totalPendingPages,
    total_cancelled_pages: totalCancelledPages,
    total_pending_bookings: totalPendingCount,
    total_cancelled_bookings: totalCancelledCount,
    bookingDetailsWithUser,
  };
};

// get all services
const getServiceListFromDB = async (offset: number, limit: number) => {
  const services = await prisma.service.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    select: {
      id: true,
      serviceName: true,
      serviceImage: true,
      duration: true,
      largeCarPrice: true,
      smallCarPrice: true,
      serviceStatus: true,
      availableTimes: true,
    },
  });

  // Get the total count of services
  const totalServices = await prisma.service.count();

  // Get the total number of completed bookings for each service
  const completedBookingsPromises = services.map(async service => {
    return prisma.bookings.count({
      where: {
        bookingStatus: BookingStatus.COMPLETED,
      },
    });
  });

  // Resolve all promises for completed bookings
  const completedBookings = await Promise.all(completedBookingsPromises);

  // Calculate the total number of completed bookings across all services
  const totalBookingsCompleted = completedBookings.reduce(
    (acc, count) => acc + count,
    0,
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalServices / limit);

  return {
    totalServices,
    totalBookingsCompleted,
    totalPages,
    services,
  };
};

// get payment in total
const getPaymentFromDB = async () => {
  // Get the total payment
  const totalPayment = await prisma.payment.aggregate({
    _sum: {
      paymentAmount: true,
    },
  });

  // Get the total payment count
  const totalPaymentCount = await prisma.payment.count();

  // Fetch all payments to calculate month-wise and day-wise totals
  const allPayments = await prisma.payment.findMany({
    select: {
      paymentAmount: true,
      createdAt: true, // Assuming `createdAt` is a DateTime field in your schema
    },
  });

  // Group payments by month and day
  const monthWiseTotal: { [key: string]: number } = {};
  const dayWiseTotal: { [key: string]: number } = {};

  allPayments.forEach(payment => {
    const date = new Date(payment.createdAt);
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
    const day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // Format: YYYY-MM-DD

    if (!monthWiseTotal[month]) {
      monthWiseTotal[month] = 0;
    }
    if (!dayWiseTotal[day]) {
      dayWiseTotal[day] = 0;
    }

    monthWiseTotal[month] += payment.paymentAmount || 0;
    dayWiseTotal[day] += payment.paymentAmount || 0;
  });

  return {
    totalPayment: totalPayment?._sum?.paymentAmount ?? 0,
    totalPaymentCount,
    monthWiseTotal,
    dayWiseTotal,
  };
};

// get all garages
const getGarageList = async (offset: number, limit: number) => {
  // Get the garages with pagination
  const garages = await prisma.garages.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    select: {
      id: true,
      garageName: true,
      garageImage: true,
      location: true,
    },
  });

  // Get the total count of garages
  const totalGarages = await prisma.garages.count();

  // Get the total number of completed bookings for each garage
  const completedBookingsPromises = garages.map(async garage => {
    return prisma.bookings.count({
      where: {
        bookingStatus: BookingStatus.COMPLETED,
      },
    });
  });

  // Resolve all promises for completed bookings
  const completedBookings = await Promise.all(completedBookingsPromises);

  // Calculate the total number of completed bookings across all garages
  const totalBookingsCompleted = completedBookings.reduce(
    (acc, count) => acc + count,
    0,
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalGarages / limit);

  return {
    totalGarages,
    totalBookingsCompleted,
    totalPages,
    garages,
  };
};

// delete garage
const deleteGarage = async (garageId: string) => {
  await prisma.garages.delete({
    where: {
      id: garageId,
    },
  });
  return {};
};

const addOfferIntoDB = async (data: any) => {
  const result = await prisma.offer.create({
    data,
  });

  return result;
};

const getOfferListFromDB = async () => {
  const offers = await prisma.offer.findMany();

  // const totalOffers = await prisma.offer.count();

  return offers;
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

const getFeedbackFromDB = async (userId: string) => {
  const feedback = await prisma.driverFeedback.findMany();

  return feedback;
};


const addPrivacyPolicyIntoDB = async (userId: string, data: any) => {
  const result = await prisma.privacyPolicy.create({
    data: {
      content: data.content,
      userId: userId,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Privacy policy not found');
  }

  return result;
}

const getPrivacyPolicyFromDB = async () => {
  const result = await prisma.privacyPolicy.findMany();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Privacy policy not found');
  }
  return result;
}

export const adminService = {
  getUserList,
  getBookingList,
  getGarageList,
  deleteGarage,
  changeUserStatusIntoDB,
  getDriverList,
  changeDriverStatusIntoDB,
  assignDriverIntoDB,
  getServiceListFromDB,
  changeServiceStatusIntoDB,
  getPaymentFromDB,
  addOfferIntoDB,
  getOfferListFromDB,
  getDriverLiveLocation,
  getFeedbackFromDB,
  addPrivacyPolicyIntoDB,
  getPrivacyPolicyFromDB,
};
