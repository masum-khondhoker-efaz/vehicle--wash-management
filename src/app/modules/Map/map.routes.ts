import express from 'express';
import auth from '../../middlewares/auth';


import { MapController } from './map.controller';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

// get map details route
router.get(
  '/',
  auth(),
  MapController.getAllPlaces
);

router.get(
  '/distance',
  auth(UserRoleEnum.CUSTOMER),
  MapController.getDistanceFromGarage
  
)

export const MapRoutes = router;
