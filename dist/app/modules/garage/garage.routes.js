"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarageRouters = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multerUpload_1 = require("../../utils/multerUpload");
const client_1 = require("@prisma/client");
const garage_controller_1 = require("./garage.controller");
const parseBody_1 = require("../../middlewares/parseBody");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const router = express_1.default.Router();
router.post('/', multerUpload_1.multerUpload.single('garageImage'), parseBody_1.parseBody, 
//  validateRequest(validateGarage.garageValidationSchema),
(0, auth_1.default)(client_1.UserRoleEnum.GARAGE_OWNER), garage_controller_1.garageController.registerGarage);
router.get('/', (0, auth_1.default)(), garage_controller_1.garageController.getGarageList);
router.get('/:garageId', (0, auth_1.default)(), garage_controller_1.garageController.getGarageById);
router.put('/:garageId', updateMulterUpload_1.updateMulterUpload.single('garageImage'), parseBody_1.parseBody, (0, auth_1.default)(), garage_controller_1.garageController.updateGarage);
router.delete('/:garageId', (0, auth_1.default)(client_1.UserRoleEnum.GARAGE_OWNER), garage_controller_1.garageController.deleteGarage);
router.post('/services/:garageId', (0, auth_1.default)(client_1.UserRoleEnum.GARAGE_OWNER), garage_controller_1.garageController.addService);
router.get('/services/:garageId', (0, auth_1.default)(), garage_controller_1.garageController.getServices);
router.get('/services/:garageId/:serviceId', (0, auth_1.default)(), garage_controller_1.garageController.getServiceById);
router.put('/services/:garageId/:serviceId', (0, auth_1.default)(client_1.UserRoleEnum.GARAGE_OWNER), garage_controller_1.garageController.updateService);
router.delete('/services/:garageId/:serviceId', (0, auth_1.default)(client_1.UserRoleEnum.GARAGE_OWNER), garage_controller_1.garageController.deleteService);
router.post('/nearby-garages', (0, auth_1.default)(), garage_controller_1.garageController.getGarageServices);
exports.GarageRouters = router;
