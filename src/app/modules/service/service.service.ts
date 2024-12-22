import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

const addServiceIntoDB = async (userId: string, serviceData: any) => {
  const { data, serviceImage } = serviceData;
  const service = await prisma.service.create({
    data: {
      ...data,
      serviceImage: serviceImage,
      userId: userId,
    },
  });
  if (!service) {
    throw new AppError(httpStatus.CONFLICT, 'Service not created');
  }

  return service;
};

const getServiceListFromDB = async (
  userId: string,
  offset: number,
  limit: number,
) => {
  const services = await prisma.service.findMany({
    skip: offset, // Skip the first `offset` records
    take: limit,
  });
  if (!services) {
    throw new AppError(httpStatus.CONFLICT, 'Services not found');
  }
  // Get the total count of customers with the role of 'CUSTOMER'
  const totalCount = await prisma.service.count();

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / limit);
  return {
    currentPage: Math.floor(offset / limit) + 1, // Current page is calculated by dividing offset by limit
    totalPages,
    total_services: totalCount,
    services,
  };
};

const getServiceByIdFromDB = async (userId: string, serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id: serviceId,
    },
  });
  if (!service) {
    throw new AppError(httpStatus.CONFLICT, 'Service not found');
  }

  return service;
};

const updateServiceIntoDB = async (
  userId: string,
  serviceId: string,
  serviceData: any,
) => {
  const { data, serviceImage } = serviceData;
  const service = await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: {
      ...data,
      serviceImage: serviceImage,
    },
  });
  if (!service) {
    throw new AppError(httpStatus.CONFLICT, 'Service not updated');
  }

  return service;
};

const deleteServiceFromDB = async (userId: string, serviceId: string) => {
  const service = await prisma.service.delete({
    where: {
      id: serviceId,
    },
  });
  if (!service) {
    throw new AppError(httpStatus.CONFLICT, 'Service not deleted');
  }

  return service;
};

export const serviceService = {
  addServiceIntoDB,
  getServiceListFromDB,
  getServiceByIdFromDB,
  updateServiceIntoDB,
  deleteServiceFromDB,
};
