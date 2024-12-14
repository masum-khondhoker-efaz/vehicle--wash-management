"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const garage_routes_1 = require("../modules/garage/garage.routes");
const driver_routes_1 = require("../modules/driver/driver.routes");
const car_routes_1 = require("../modules/car/car.routes");
const review_routes_1 = require("../modules/review/review.routes");
const bookings_routes_1 = require("../modules/bookings/bookings.routes");
const map_routes_1 = require("../modules/Map/map.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_routes_1.AuthRouters,
    },
    {
        path: '/users',
        route: user_routes_1.UserRouters,
    },
    {
        path: '/garages',
        route: garage_routes_1.GarageRouters,
    },
    {
        path: '/drivers',
        route: driver_routes_1.driverRoutes,
    },
    {
        path: '/cars',
        route: car_routes_1.carRoutes,
    },
    {
        path: '/reviews',
        route: review_routes_1.reviewRoutes,
    },
    {
        path: '/bookings',
        route: bookings_routes_1.bookingRoutes,
    },
    {
        path: '/map',
        route: map_routes_1.MapRoutes,
    },
    {
        path: '/payment',
        route: payment_routes_1.PaymentRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
