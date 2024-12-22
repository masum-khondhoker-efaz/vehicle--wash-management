import catchAsync from '../../utils/catchAsync';
import prisma from '../../utils/prisma';
import {
  BookingStatus,
  PaymentStatus,
  ServiceStatus,
  UserRoleEnum,
} from '@prisma/client';

// get all users
const getUserList = async (offset: number, limit: number) => {
  // Fetch paginated user data with cars
  const customers = await prisma.user.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    where: {
      role: UserRoleEnum.CUSTOMER,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      role: true,
    },
  });

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
    customers, 
  };
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
    select: {
      id: true,
    },
  });

  // Get the total count of pending bookings
  const totalPendingCount = await prisma.bookings.count({
    where: {
      bookingStatus: BookingStatus.PENDING,
    },
  });

  // Get the cancelled bookings with pagination (if needed)
  const cancelBookings = await prisma.bookings.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit, // Limit the result to `limit` records
    where: {
      bookingStatus: BookingStatus.CANCELLED,
    },
    select: {
      id: true,
    },
  });

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
    bookings,
    total_cancelled_bookings: totalCancelledCount,
    cancelBookings,
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

export const adminService = {
  getUserList,
  getBookingList,
  getGarageList,
  deleteGarage,
};