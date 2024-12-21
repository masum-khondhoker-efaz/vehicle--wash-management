import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload, uploadFileToSpace } from '../../utils/multerUpload';
import { UserRoleEnum } from '@prisma/client';
import { bookingController } from './bookings.controller';
import { bookingValidation } from './bookings.validation';


const router = express.Router();


router.post(
    '/',
    validateRequest(bookingValidation.bookingSchema),
    auth(UserRoleEnum.CUSTOMER),
    bookingController.addBooking
)

router.get(
    '/',
    auth(),
    bookingController.getBookingList,
);

router.get(
    '/:bookingId',
    auth(),
    bookingController.getBookingById,
);

router.put(
    '/:bookingId',
    validateRequest(bookingValidation.updateBookingSchema),
    auth(UserRoleEnum.CUSTOMER),
    bookingController.updateBooking,
);

router.put(
    '/cancel/:bookingId',
    auth(UserRoleEnum.CUSTOMER),
    bookingController.cancelBookingStatus,
);

router.delete(
    '/:bookingId',
    auth(UserRoleEnum.CUSTOMER),
    bookingController.deleteBooking,
);

router.post(
    '/apply-promo/:bookingId',
    validateRequest(bookingValidation.applyPromoCodeSchema), 
    auth(UserRoleEnum.CUSTOMER),
    bookingController.applyPromoCode
)

export const bookingRoutes = router;