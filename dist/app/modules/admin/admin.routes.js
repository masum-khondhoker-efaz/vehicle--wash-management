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
//get all bookings
router.get('/bookings', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getBookingList);
// get all garages
router.get('/garages', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.getGarageList);
// delete garage
router.delete('/garages/:garageId', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPER_ADMIN), admin_controller_1.adminController.deleteGarage);
exports.AdminRoutes = router;
