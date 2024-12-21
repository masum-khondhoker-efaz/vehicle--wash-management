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
    throw new Error('Service not created');
  }

  return service;
};

const getServiceListFromDB = async (userId: string) => {
    const services = await prisma.service.findMany();
    if (!services) {
        throw new Error('Services not found');
    }

    return services;
}

const getServiceByIdFromDB = async (userId: string, serviceId: string) => {
    const service = await prisma.service.findUnique({
        where: {
            id: serviceId,
        },
    });
    if (!service) {
        throw new Error('Service not found');
    }

    return service;
}

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
    throw new Error('Service not updated');
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
        throw new Error('Service not deleted');
    }

    return service;
}

export const serviceService = {
    addServiceIntoDB,
    getServiceListFromDB,
    getServiceByIdFromDB,
    updateServiceIntoDB,
    deleteServiceFromDB,
};
