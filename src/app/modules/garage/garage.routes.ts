import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload, uploadFileToSpace } from '../../utils/multerUpload';
import { UserRoleEnum } from '@prisma/client';
import { validateGarage } from './garage.validation';
import { garageController } from './garage.controller';
import { parseBody } from '../../middlewares/parseBody';
import { updateMulterUpload } from '../../utils/updateMulterUpload';


const router = express.Router();

router.post(
    '/',
     multerUpload.single('garageImage'),
     parseBody,
    //  validateRequest(validateGarage.garageValidationSchema),
     auth(UserRoleEnum.GARAGE_OWNER),
     garageController.registerGarage,

);

router.get(
    '/',
    auth(),
    garageController.getGarageList,
);

router.get(
    '/:garageId',
    auth(),
    garageController.getGarageById,
);

router.put(
    '/:garageId',
    updateMulterUpload.single('garageImage'),
    parseBody,
    auth(),
    garageController.updateGarage,
);

router.delete(
    '/:garageId',
    auth(UserRoleEnum.GARAGE_OWNER),
    garageController.deleteGarage,
);


router.post(
  '/services/:garageId',
  auth(UserRoleEnum.GARAGE_OWNER),
  garageController.addService,
);

router.get(
  '/services/:garageId',
  auth(),
  garageController.getServices,
);

router.get(
  '/services/:garageId/:serviceId',
  auth(),
  garageController.getServiceById,
);


router.put(
  '/services/:garageId/:serviceId',
  auth(UserRoleEnum.GARAGE_OWNER),
  garageController.updateService,
);

router.delete(
  '/services/:garageId/:serviceId',
  auth(UserRoleEnum.GARAGE_OWNER),
  garageController.deleteService,
);

export const GarageRouters = router;