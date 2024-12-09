import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import emailSender from '../../utils/emailSender';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { JwtPayload } from 'jsonwebtoken';



const registerGarageIntoDB = async (userId: string, garageData: any) => {
  const { data, garageImage } = garageData;

  const transaction = await prisma.$transaction(async (prisma) => {
    // Create the garage
    const createdGarage = await prisma.garages.create({
      data: {
        userId: userId,
        garageName: data.garageName,
        garageImage: garageImage,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        minimumPrice: data.minimumPrice,
        availableTimes: data.availableTimes,
      },
    });

    // Add services
    const services = data.services.map((service: any) => ({
      serviceName: service.serviceName,
      servicePrice: service.servicePrice,
      garageId: createdGarage.id,
      userId: userId,
    }));

    await prisma.service.createMany({
      data: services,
    });

    // Update garage with service IDs
    const serviceIds = await prisma.service.findMany({
      where: { garageId: createdGarage.id },
      select: { id: true },
    });

    await prisma.garages.update({
      where: { id: createdGarage.id },
      data: {
        serviceIds: serviceIds.map((service) => service.id),
      },
    });

    return createdGarage;
  });

  return transaction;
};


const getGarageListFromDB = async () => {
  const garages = await prisma.garages.findMany({
    include: {
      service: true,
    },
  });

  return garages;
}

const getGarageByIdFromDB = async (garageId: string) => {
  const garage = await prisma.garages.findUnique({
    where: {
      id: garageId,
    },
    include: {
      service: true,
    },
  });

  return garage;
}

const updateGarageIntoDB = async (userId: string, garageId: string, garageData: any) => {

  const transaction = await prisma.$transaction(async (prisma) => {
    // Update the garage
    const updatedGarage = await prisma.garages.update({
      where: {
        id: garageId,
        userId: userId,
      },
      data: {
        garageName: garageData.garageName,
        garageImage: garageData.garageImage,
        description: garageData.description,
        location: garageData.location,
        latitude: garageData.latitude,
        longitude: garageData.longitude,
        minimumPrice: garageData.minimumPrice,
        availableTimes: garageData.availableTimes,
      },
    });

    // Add services
    const services = garageData.services.map((service: any) => ({
      serviceName: service.serviceName,
      servicePrice: service.servicePrice,
      garageId: updatedGarage.id,
      userId: userId,
    }));

    await prisma.service.deleteMany({
      where: {
        garageId: updatedGarage.id,
      },
    });

    await prisma.service.createMany({
      data: services,
      
    });

    // Update garage with service IDs
    const serviceIds = await prisma.service.findMany({
      where: { garageId: updatedGarage.id },
      select: { id: true },
    });

    await prisma.garages.update({
      where: { id: updatedGarage.id },
      data: {
        serviceIds: serviceIds.map((service) => service.id),
      },
    });

    return updatedGarage;
  });

  return transaction;
}

const deleteGarageFromDB = async (userId: string, garageId: string) => {
 
  const transaction = await prisma.$transaction(async (prisma) => {
    // Delete services associated with the garage
    await prisma.service.deleteMany({
      where: {
        garageId: garageId,
        userId: userId,
      },
    });

    // Delete the garage
    const deletedGarage = await prisma.garages.delete({
      where: {
        id: garageId,
        userId: userId,
      },
    });

    return deletedGarage;
  });

  return transaction;

};


const addServiceIntoDB = async (userId: string, garageId: string, serviceData: any) => {
  const { serviceName, servicePrice } = serviceData;
 
  const transaction = await prisma.$transaction(async (prisma) => {
  const service = await prisma.service.create({
    data: {
      serviceName: serviceName,
      servicePrice: servicePrice,
      garageId: garageId,
      userId: userId,
    },
  });

  const garage = await prisma.garages.update({
    where: {
      id: garageId,
    },
    data: {
      serviceIds: {
        push: service.id,
      },
    },
  });

  return {service, garage};
});
  return transaction;
}

const getServicesFromDB = async (userId: string, garageId: string) => {
  const services = await prisma.service.findMany({
    where: {
      garageId: garageId,
      userId: userId,
    },
  });

  return services;
};

const getServiceByIdFromDB = async (userId: string, serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id: serviceId,
      userId: userId,
    },
  });

  return service;
};

const updateServiceIntoDB = async (
  userId: string,
  serviceId: string,
  serviceData: any,
) => {
  const { serviceName, servicePrice } = serviceData;

  const service = await prisma.service.update({
    where: {
      id: serviceId,
      userId: userId,
    },
    data: {
      serviceName: serviceName,
      servicePrice: servicePrice,
    },
  });

  return service;
};

const deleteServiceFromDB = async (userId: string, garageId: string, serviceId: string) => {

  const transaction = await prisma.$transaction(async (prisma) => {
  const service = await prisma.service.delete({
    where: {
      id: serviceId,
      userId: userId,
      garageId: garageId,
    },
  });

    const garage = await prisma.garages.findUnique({
      where: {
        id: garageId,
      },
      select: {
        serviceIds: true,
      },
    });

    const serviceIds = await prisma.garages.update({
      where: {
        id: garageId,
      },
      data: {
        serviceIds: {
          set: garage?.serviceIds.filter((id: string) => id !== serviceId),
        },
      },
    });
  

  return {service, serviceIds};
});
  return transaction;
}



export const garageService = {
     registerGarageIntoDB,
     getGarageListFromDB,
     getGarageByIdFromDB,
     updateGarageIntoDB,
     deleteGarageFromDB,
     addServiceIntoDB,
     getServicesFromDB,
     getServiceByIdFromDB,
     updateServiceIntoDB,
     deleteServiceFromDB
    };