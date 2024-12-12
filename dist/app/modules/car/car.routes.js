"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multerUpload_1 = require("../../utils/multerUpload");
const client_1 = require("@prisma/client");
const parseBody_1 = require("../../middlewares/parseBody");
const car_controller_1 = require("./car.controller");
const router = express_1.default.Router();
router.post('/', multerUpload_1.multerUpload.single('carImage'), parseBody_1.parseBody, (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), car_controller_1.carController.addCar);
router.get('/', (0, auth_1.default)(), car_controller_1.carController.getCarList);
router.get('/:carId', (0, auth_1.default)(), car_controller_1.carController.getCarById);
router.put('/:carId', multerUpload_1.multerUpload.single('carImage'), parseBody_1.parseBody, (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), car_controller_1.carController.updateCar);
router.delete('/:carId', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), car_controller_1.carController.deleteCar);
exports.carRoutes = router;
