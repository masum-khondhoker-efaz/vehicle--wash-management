"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const map_controller_1 = require("./map.controller");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// get map details route
router.get('/', (0, auth_1.default)(), map_controller_1.MapController.getAllPlaces);
router.get('/distance', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), map_controller_1.MapController.getDistanceFromGarage);
exports.MapRoutes = router;
