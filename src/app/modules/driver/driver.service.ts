import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import { UserRoleEnum } from '@prisma/client';



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
        role:  UserRoleEnum.DRIVER,
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

const updateDriverIntoDB = async (userId: string, driverId: string, driverData: any) => {
  

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

export const driverService = {
  addDriverIntoDB,
  getDriverListFromDB,
  getDriverByIdFromDB,
  updateDriverIntoDB,
  deleteDriverFromDB,
};
