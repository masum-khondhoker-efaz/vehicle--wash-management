"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const multerUpload_1 = require("../../utils/multerUpload");
const client_1 = require("@prisma/client");
const driver_controller_1 = require("./driver.controller");
const parseBody_1 = require("../../middlewares/parseBody");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const driver_validation_1 = require("./driver.validation");
const router = express_1.default.Router();
router.post('/', multerUpload_1.multerUpload.single('driverImage'), parseBody_1.parseBody, (0, validateRequest_1.default)(driver_validation_1.driverValidation.driverSchema), (0, auth_1.default)(client_1.UserRoleEnum.SUPER_ADMIN, client_1.UserRoleEnum.ADMIN), driver_controller_1.driverController.addDriver);
router.get('/', (0, auth_1.default)(), driver_controller_1.driverController.getDriverList);
router.get('/get-bookings', (0, auth_1.default)(client_1.UserRoleEnum.DRIVER), driver_controller_1.driverController.getBookings);
router.get('/booking-details/:bookingId', (0, auth_1.default)(client_1.UserRoleEnum.DRIVER), driver_controller_1.driverController.getBookingById);
router.get('/:driverId', (0, auth_1.default)(), driver_controller_1.driverController.getDriverById);
router.put('/:driverId', updateMulterUpload_1.updateMulterUpload.single('driverImage'), parseBody_1.parseBody, (0, validateRequest_1.default)(driver_validation_1.driverValidation.updateDriverSchema), (0, auth_1.default)(client_1.UserRoleEnum.SUPER_ADMIN, client_1.UserRoleEnum.ADMIN), driver_controller_1.driverController.updateDriver);
router.delete('/:driverId', (0, auth_1.default)(client_1.UserRoleEnum.SUPER_ADMIN, client_1.UserRoleEnum.ADMIN), driver_controller_1.driverController.deleteDriver);
exports.driverRoutes = router;
