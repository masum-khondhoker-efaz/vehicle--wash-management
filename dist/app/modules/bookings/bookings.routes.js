"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const client_1 = require("@prisma/client");
const bookings_controller_1 = require("./bookings.controller");
const bookings_validation_1 = require("./bookings.validation");
const router = express_1.default.Router();
router.post('/', (0, validateRequest_1.default)(bookings_validation_1.bookingValidation.bookingSchema), (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), bookings_controller_1.bookingController.addBooking);
router.get('/', (0, auth_1.default)(), bookings_controller_1.bookingController.getBookingList);
router.get('/:bookingId', (0, auth_1.default)(), bookings_controller_1.bookingController.getBookingById);
router.put('/:bookingId', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), bookings_controller_1.bookingController.updateBooking);
router.put('/cancel/:bookingId', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), bookings_controller_1.bookingController.cancelBookingStatus);
router.delete('/:bookingId', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), bookings_controller_1.bookingController.deleteBooking);
exports.bookingRoutes = router;
