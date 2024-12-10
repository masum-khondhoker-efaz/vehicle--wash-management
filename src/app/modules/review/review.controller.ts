import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { reviewService } from './review.service';


const addReview = catchAsync(async (req, res) => {
    const userId = req.user.id;
   
    const result = await reviewService.addReviewIntoDB(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Review registered successfully',
        data: result,
    });
});


const getReviewList = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const reviews = await reviewService.getReviewListFromDB(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review list',
        data: reviews,
    });
});

const getReviewById = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const reviewId = req.params.reviewId;
    const review = await reviewService.getReviewByIdFromDB(userId, reviewId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review details',
        data: review,
    });
});

const updateReview = catchAsync(async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;
    const data = req.body;

    const result = await reviewService.updateReviewIntoDB(userId, reviewId, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review updated successfully',
        data: result,
    });
});

const deleteReview = catchAsync(async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;

    const result = await reviewService.deleteReviewFromDB(userId, reviewId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review deleted successfully',
        data: result,
    });
});

export const reviewController = {
    addReview,
    getReviewList,
    getReviewById,
    updateReview,
    deleteReview,
};
