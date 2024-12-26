import prisma from '../../utils/prisma';

const addReviewIntoDB = async (userId: string, reviewData: any) => {
  const transaction = await prisma.$transaction(async prisma => {
    const createdReview = await prisma.review.create({
      data: {
        rating: reviewData.rating,
        customerId: userId,
        serviceId: reviewData.serviceId,
        bookingId: reviewData.bookingId,
      },
    });

    await prisma.bookings.update({
      where: {
        id: reviewData.bookingId,
      },
      data: {
        isRated: true,
      },
    });


    return createdReview;
  });

  return transaction;
};

const getReviewListFromDB = async (userId: string) => {
  const reviewStats = await prisma.review.aggregate({
    _count: {
      id: true,
    },
    _avg: {
      rating: true,
    },
  });
  const reviews = await prisma.review.findMany({
    include: {
      service: true,
    },
  });

  return { reviewStats, reviews };
};

const getReviewByIdFromDB = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  return review;
};

const updateReviewIntoDB = async (
  userId: string,
  reviewId: string,
  reviewData: { serviceId: string; rating: number },
) => {
  const review = await prisma.review.update({
    where: {
      id: reviewId,
      customerId: userId,
      serviceId: reviewData.serviceId,
    },
    data: {
      rating: reviewData.rating,
    },
  });

  return review;
};

const deleteReviewFromDB = async (userId: string, reviewId: string) => {
  const review = await prisma.review.delete({
    where: {
      id: reviewId,
      customerId: userId,
    },
  });

  return review;
};

const deleteAllReviewFromDB = async (userId: string) => {
  const reviews = await prisma.review.deleteMany({
  });

  return reviews;
};

export const reviewService = {
  addReviewIntoDB,
  getReviewListFromDB,
  getReviewByIdFromDB,
  updateReviewIntoDB,
  deleteReviewFromDB,
  deleteAllReviewFromDB,
};
