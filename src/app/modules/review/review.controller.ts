import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { reviewService } from './review.service';


const addReview = catchAsync(async (req, res) => {
    const user = req.user as any;
   
    const result = await reviewService.addReviewIntoDB(user.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Review registered successfully',
        data: result,
    });
});


const getReviewList = catchAsync(async (req, res) => {
    const user = req.user as any;
    const reviews = await reviewService.getReviewListFromDB(user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review list',
        data: reviews,
    });
});

const getReviewById = catchAsync(async (req, res) => {
    const user = req.user as any;
    const reviewId = req.params.reviewId;
    const review = await reviewService.getReviewByIdFromDB(user.id, reviewId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review details',
        data: review,
    });
});

const updateReview = catchAsync(async (req, res) => {
    const reviewId = req.params.reviewId;
    const user = req.user as any;
    const data = req.body;

    const result = await reviewService.updateReviewIntoDB(user.id, reviewId, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review updated successfully',
        data: result,
    });
});

const deleteReview = catchAsync(async (req, res) => {
    const reviewId = req.params.reviewId;
    const user = req.user as any;

    const result = await reviewService.deleteReviewFromDB(user.id, reviewId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Review deleted successfully',
        data: result,
    });
});

const deleteAllReview = catchAsync(async (req, res) => {
    const user = req.user as any;

    const result = await reviewService.deleteAllReviewFromDB(user.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'All Review deleted successfully',
        data: result,
    });
});

export const reviewController = {
    addReview,
    getReviewList,
    getReviewById,
    updateReview,
    deleteReview,
    deleteAllReview,
};
