import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRoleEnum } from '@prisma/client';
import { serviceController } from './service.controller';
import { serviceValidation } from './service.validation';
import { multerUpload } from '../../utils/multerUpload';
import { parse } from 'path';
import { parseBody } from '../../middlewares/parseBody';
import { updateMulterUpload } from '../../utils/updateMulterUpload';

const router = express.Router();

router.post(
  '/',
  multerUpload.single('serviceImage'),
  parseBody,
  validateRequest(serviceValidation.serviceSchema),
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  serviceController.addService,
);

router.get('/', auth(), serviceController.getServiceList);

router.get('/:serviceId', auth(), serviceController.getServiceById);

router.put( 
  '/:serviceId',
  updateMulterUpload.single('serviceImage'),
  parseBody,
  validateRequest(serviceValidation.updateServiceSchema),
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  serviceController.updateService,
);


router.delete(
  '/:serviceId',
  auth(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN),
  serviceController.deleteService,
);

export const ServiceRoutes = router;
