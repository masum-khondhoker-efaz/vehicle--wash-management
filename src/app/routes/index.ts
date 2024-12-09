import express from 'express';
import { AuthRouters } from '../modules/auth/auth.routes';
import { UserRouters } from '../modules/user/user.routes';
import path from 'path';
import { GarageRouters } from '../modules/garage/garage.routes';
import { driverRoutes } from '../modules/driver/driver.routes';
import { carRoutes } from '../modules/car/car.routes';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/garages',
    route: GarageRouters,
  },
  {
    path: '/drivers',
    route: driverRoutes
  },
  {
    path: '/cars',
    route: carRoutes
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
