import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import QueryBuilder from '../../utils/querBuilder';

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
    throw new AppError(httpStatus.BAD_REQUEST, 'Service not created');
  }

  return service;
};



// const getServiceListFromDB = async (
//   userId: string,
//   offset: number,
//   limit: number,
//   searchTerm: string,
// ) => {
//   const queryBuilder = new QueryBuilder(prisma.service.findMany);

//   const { query, options } = queryBuilder
//     .paginate({ page: Math.floor(offset / limit) + 1, limit })
//     .setSearch(['serviceName'], searchTerm)
//     .build();

//   const services = await prisma.service.findMany({
//     where: {
//       ...query.where,
//       OR: [
//         {
//           serviceName: {
//             contains: searchTerm,
//             mode: 'insensitive',
//           },
//         },
//       ],
//     },
//     skip: options.skip,
//     take: options.limit,
//   });

//   if (!services) {
//     throw new AppError(httpStatus.CONFLICT, 'Services not found');
//   }

//   const totalCount = await prisma.service.count({
//     where: {
//       ...query.where,
//       OR: [
//         {
//           serviceName: {
//             contains: searchTerm,
//             mode: 'insensitive',
//           },
//         },
//       ],
//     },
//   });

//   const totalPages = Math.ceil(totalCount / limit);
//   return {
//     currentPage: Math.floor(offset / limit) + 1,
//     totalPages,
//     total_services: totalCount,
//     services,
//   };
// };


const getServiceListFromDB = async (
  userId: string,
  offset: number,
  limit: number,
  searchTerm: string,
) => {
  const queryBuilder = new QueryBuilder(prisma.service.findMany);

  const { query, options } = queryBuilder
    .paginate({ page: Math.floor(offset / limit) + 1, limit })
    .setSearch(['serviceName'], searchTerm)
    .build();

  const services = await prisma.service.findMany({
    where: {
      ...query.where,
      OR: [
        {
          serviceName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
    skip: options.skip,
    take: options.limit,
    include: {
      reviews: true,
    },
  });

  if (!services) {
    throw new AppError(httpStatus.CONFLICT, 'Services not found');
  }

  const servicesWithReviewStats = services.map(service => {
    const totalReviews = service.reviews.length;
    const avgRating = totalReviews
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews
      : 0;

    // Exclude the reviews field from the response
    const { reviews, ...serviceWithoutReviews } = service;

    return {
      ...serviceWithoutReviews,
      totalReviews,
      avgRating,
    };
  });

  const totalCount = await prisma.service.count({
    where: {
      ...query.where,
      OR: [
        {
          serviceName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
  });

  const totalPages = Math.ceil(totalCount / limit);
  return {
    currentPage: Math.floor(offset / limit) + 1,
    totalPages,
    total_services: totalCount,
    services: servicesWithReviewStats,
  };
};



const getServiceByIdFromDB = async (userId: string, serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id: serviceId,
    },
    include: {
      reviews: true,
    },
  });

  if (!service) {
    throw new AppError(httpStatus.CONFLICT, 'Service not found');
  }

  const totalReviews = service.reviews.length;
  const avgRating = totalReviews
    ? service.reviews.reduce((sum, review) => sum + review.rating, 0) /
      totalReviews
    : 0;

  // Exclude the reviews field from the response
  const { reviews, ...serviceWithoutReviews } = service;

  return {
    ...serviceWithoutReviews,
    totalReviews,
    avgRating,
  };
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
