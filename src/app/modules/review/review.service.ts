import prisma from '../../utils/prisma';



const addReviewIntoDB = async (userId: string, reviewData: any) => {    
    const transaction = await prisma.$transaction(async prisma => {
        const createdReview = await prisma.review.create({
          data: {
            rating: reviewData.rating,
            customerId: userId,
            garageId: reviewData.garageId,
          },
        });
    
        return createdReview;
    });
    
    return transaction;
}
    

const getReviewListFromDB = async (userId: string,) => {
    const garages = await prisma.garages.findMany({
      where: {
        userId: userId,
      },
    });
  const reviewStats = await prisma.review.aggregate({
    _count: {
      id: true,
    },
    _avg: {
      rating: true,
    },
    where: {
      garageId: {
        in: garages.map(garage => garage.id),
      },
    },
  });

const reviews = await prisma.review.findMany({
    where: {
        garageId: {
            in: garages.map(garage => garage.id),
        },
    },
    select: {
        id: true,
        rating: true,
        customerId: true,
        garageId: true,
        createdAt: true,
        updatedAt: true,
    },
});

return { reviewStats, reviews };
};

const getReviewByIdFromDB = async (userId: string, reviewId: string) => {
    const garages = await prisma.garages.findMany({
      where: {
        userId: userId,
      },
    });
    const review = await prisma.review.findUnique({
        where: {
        id: reviewId,
        garageId: {
            in: garages.map(garage => garage.id),
        },
        },
    });
    
    return review;
}

const updateReviewIntoDB = async (
    userId: string,
    reviewId: string,
    reviewData: {rating: number},
) => {
    console.log(userId, reviewId, reviewData);
    const review = await prisma.review.update({
        where: {
        id: reviewId,
        customerId: userId,
        },
        data: {
        rating: reviewData.rating,
        },
    });
    
    return review;
}

const deleteReviewFromDB = async (userId: string, reviewId: string) => {
  
    const review = await prisma.review.delete({
        where: {
        id: reviewId,
        customerId: userId,
      }
    });
    
    return review;
}

export const reviewService = {
    addReviewIntoDB,
    getReviewListFromDB,
    getReviewByIdFromDB,
    updateReviewIntoDB,
    deleteReviewFromDB,
};
