import express from 'express';
import auth from '../../middlewares/auth';


import { MapController } from './map.controller';

const router = express.Router();

// get map details route
router.get(
  '/',
  auth(),
  MapController.getAllPlaces
);

export const MapRoutes = router;
