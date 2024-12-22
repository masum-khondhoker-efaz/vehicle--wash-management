import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload, uploadFileToSpace } from '../../utils/multerUpload';
import { UserRoleEnum } from '@prisma/client';
import { parseBody } from '../../middlewares/parseBody';
import { reviewController } from './review.controller';
import { reviewValidation } from './review.validation';


const router = express.Router();

router.post(
    '/',
    validateRequest(reviewValidation.ReviewSchema),
    auth(UserRoleEnum.CUSTOMER),
    reviewController.addReview,
)

router.get(
    '/',
    auth(),
    reviewController.getReviewList,
);

router.delete(
    '/all',
    auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
    reviewController.deleteAllReview,
);
router.get(
    '/:reviewId',
    auth(),
    reviewController.getReviewById,
);

router.put(
  '/:reviewId',
  validateRequest(reviewValidation.ReviewSchema),
  auth(UserRoleEnum.CUSTOMER),
  reviewController.updateReview,
);

router.delete(
    '/:reviewId',
    auth(UserRoleEnum.CUSTOMER),
    reviewController.deleteReview,
);


export const reviewRoutes = router;

