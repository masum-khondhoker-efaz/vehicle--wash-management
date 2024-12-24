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
    },
  });

  return data;
}

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
const getBookingList = async (offset: number, limit: number) => {
  // Get the pending bookings with pagination
  const bookings = await prisma.bookings.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    where: {
      bookingStatus: BookingStatus.PENDING,
    },
  });

  // Get the total count of pending bookings
  const totalPendingCount = await prisma.bookings.count({
    where: {
      bookingStatus: BookingStatus.PENDING,
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
        },
      });
      return {
        id: booking.id,
        bookingStatus: booking.bookingStatus,
        serviceStatus: booking.serviceStatus,
        serviceDate: booking.serviceDate,
        bookingTime: booking.bookingTime,
        location: booking.location,
        user,
      };
    }),
  );

  // Fetch user details for each cancelled booking
  // const cancelBookingDetailsWithUser = await Promise.all(
  //   cancelBookings.map(async booking => {
  //     const user = await prisma.user.findUnique({
  //       where: {
  //         id: booking.customerId,
  //       },
  //       select: {
  //         fullName: true,
  //         profileImage: true,
  //         email: true,
  //         phoneNumber: true,
  //       },
  //     });
  //     return {
  //       ...booking,
  //       user,
  //     };
  //   }),
  // );

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
    // cancelBookingDetailsWithUser,
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
}


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


  return offers
  
};


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
};
