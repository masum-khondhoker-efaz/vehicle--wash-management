import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload, uploadFileToSpace } from '../../utils/multerUpload';
import { UserRoleEnum } from '@prisma/client';
import { driverController } from './driver.controller';
import { parseBody } from '../../middlewares/parseBody';
import { updateMulterUpload } from '../../utils/updateMulterUpload';
import { driverValidation } from './driver.validation';


const router = express.Router();

router.post(
    '/',
    multerUpload.single('driverImage'),
    parseBody,
    validateRequest(driverValidation.driverSchema),
    auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
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
    updateMulterUpload.single('driverImage'),
    parseBody,
    validateRequest(driverValidation.updateDriverSchema),
    auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
    driverController.updateDriver,
);

router.delete(
    '/:driverId',
    auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
    driverController.deleteDriver,
);



export const driverRoutes = router;