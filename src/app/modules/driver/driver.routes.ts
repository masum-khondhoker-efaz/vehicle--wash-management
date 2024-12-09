import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload, uploadFileToSpace } from '../../utils/multerUpload';
import { UserRoleEnum } from '@prisma/client';
import { driverController } from './driver.controller';
import { parseBody } from '../../middlewares/parseBody';


const router = express.Router();

router.post(
    '/',
    multerUpload.single('driverImage'),
    parseBody,
    auth(UserRoleEnum.CUSTOMER),
    driverController.addDriver,
)

router.get(
    '/',
    auth(),
    driverController.getDriverList,
);

router.get(
    '/:driverId',
    auth(),
    driverController.getDriverById,
);

router.put(
    '/:driverId',
    multerUpload.single('driverImage'),
    parseBody,
    auth(UserRoleEnum.CUSTOMER),
    driverController.updateDriver,
);

router.delete(
    '/:driverId',
    auth(UserRoleEnum.CUSTOMER),
    driverController.deleteDriver,
);



export const driverRoutes = router;