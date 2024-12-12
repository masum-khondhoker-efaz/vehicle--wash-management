"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multerUpload_1 = require("../../utils/multerUpload");
const client_1 = require("@prisma/client");
const driver_controller_1 = require("./driver.controller");
const parseBody_1 = require("../../middlewares/parseBody");
const router = express_1.default.Router();
router.post('/', multerUpload_1.multerUpload.single('driverImage'), parseBody_1.parseBody, (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), driver_controller_1.driverController.addDriver);
router.get('/', (0, auth_1.default)(), driver_controller_1.driverController.getDriverList);
router.get('/:driverId', (0, auth_1.default)(), driver_controller_1.driverController.getDriverById);
router.put('/:driverId', multerUpload_1.multerUpload.single('driverImage'), parseBody_1.parseBody, (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), driver_controller_1.driverController.updateDriver);
router.delete('/:driverId', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), driver_controller_1.driverController.deleteDriver);
exports.driverRoutes = router;