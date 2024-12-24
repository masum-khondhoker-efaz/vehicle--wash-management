"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const admin_controller_1 = require("./admin.controller");
const router = express_1.default.Router();
// Get all users
router.get('/users', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getUserList);
// change user status
router.patch('/users/:userId/:status', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.changeUserStatus);
// get all drivers
router.get('/drivers', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getDriverList);
// assign driver
router.patch('/drivers/:driverId/:bookingId', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.assignDriver);
//get all bookings
router.get('/bookings', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getBookingList);
// get all services
router.get('/services', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getServiceList);
//service status change
router.patch('/services/:serviceId/:status', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.changeServiceStatus);
// get payment in total
router.get('/payment', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getPayment);
// get all garages
router.get('/garages', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getGarageList);
// delete garage
router.delete('/garages/:garageId', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.deleteGarage);
// add offer
router.post('/offers', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.addOffer);
// get all offers
router.get('/offers', (0, auth_1.default)(), admin_controller_1.adminController.getOfferList);
exports.AdminRoutes = router;
