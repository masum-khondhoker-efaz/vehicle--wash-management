import express from 'express';
import { AuthRouters } from '../modules/auth/auth.routes';
import { UserRouters } from '../modules/user/user.routes';
import path from 'path';
import { driverRoutes } from '../modules/driver/driver.routes';
import { carRoutes } from '../modules/car/car.routes';
import { reviewRoutes } from '../modules/review/review.routes';
import { bookingRoutes } from '../modules/bookings/bookings.routes';
import { MapRoutes } from '../modules/Map/map.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { CouponRoutes } from '../modules/coupon/coupon.routes';
import { notificationsRoute } from '../modules/notification/notification.route';
// import { notificationsRoute } from '../modules/notification/notification.route';
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
    path: '/services',
    route: ServiceRoutes,
  },
  // {
  //   path: '/garages',
  //   route: GarageRouters,
  // },
  {
    path: '/drivers',
    route: driverRoutes,
  },
  {
    path: '/cars',
    route: carRoutes,
  },
  {
    path: '/coupon',
    route: CouponRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
  {
    path: '/bookings',
    route: bookingRoutes,
  },
  {
    path: '/map',
    route: MapRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/notifications',
    route: notificationsRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
