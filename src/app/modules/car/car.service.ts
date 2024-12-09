import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import emailSender from '../../utils/emailSender';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';


const addCarIntoDB = async (userId: string, carData: any) => {
  const { data, carImage } = carData;

  const transaction = await prisma.$transaction(async prisma => {
    // Create the car
    const createdCar = await prisma.car.create({
      data: {
        userId: userId,
        carName: data.carName,
        carImage: carImage,
        driverId: data.driverId,
      },
    });

    return createdCar;
  });

  return transaction;
};


const getCarListFromDB = async (userId: string) => {
    const cars = await prisma.car.findMany({
        where: {
        userId: userId,
        },
    });
    
    return cars;
}

const getCarByIdFromDB = async (carId: string) => {
    const car = await prisma.car.findUnique({
        where: {
        id: carId,
        },
    });

    return car;
}

const updateCarIntoDB = async (userId: string, carId: string, carData: any) => {
    

    const transaction = await prisma.$transaction(async prisma => {
        // Update the car
        const updatedCar = await prisma.car.update({
            where: {
                id: carId,
            },
            data: {
                carName: carData.carName,
                carImage: carData.carImage,
                driverId: carData.driverId,
            },
        });

        return updatedCar;
    });

    return transaction;
};


const deleteCarFromDB = async (userId: string, carId: string) => {
    const transaction = await prisma.$transaction(async prisma => {
        // Delete the car
        await prisma.car.delete({
            where: {
                id: carId,
            },
        });

        return 'Car deleted successfully';
    });

    return transaction;
};

export const carService = {
    addCarIntoDB,
    getCarListFromDB,
    getCarByIdFromDB,
    updateCarIntoDB,
    deleteCarFromDB,
};