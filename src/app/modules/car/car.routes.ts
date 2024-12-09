import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload, uploadFileToSpace } from '../../utils/multerUpload';
import { UserRoleEnum } from '@prisma/client';
import { parseBody } from '../../middlewares/parseBody';
import { carController } from './car.controller';


const router = express.Router();


router.post(
    '/',
    multerUpload.single('carImage'),
    parseBody,
    auth(UserRoleEnum.CUSTOMER),
    carController.addCar
)

router.get(
    '/',
    auth(),
    carController.getCarList,
);

router.get(
    '/:carId',
    auth(),
    carController.getCarById,
);

router.put(
    '/:carId',
    multerUpload.single('carImage'),
    parseBody,
    auth(UserRoleEnum.CUSTOMER),
    carController.updateCar,
);

router.delete(
    '/:carId',
    auth(UserRoleEnum.CUSTOMER),
    carController.deleteCar,
);


export const carRoutes = router;