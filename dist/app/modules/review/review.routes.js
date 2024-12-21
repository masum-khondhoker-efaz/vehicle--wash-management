"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const client_1 = require("@prisma/client");
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
router.post('/', (0, validateRequest_1.default)(review_validation_1.reviewValidation.ReviewSchema), (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), review_controller_1.reviewController.addReview);
router.get('/', (0, auth_1.default)(), review_controller_1.reviewController.getReviewList);
router.get('/:reviewId', (0, auth_1.default)(), review_controller_1.reviewController.getReviewById);
router.put('/:reviewId', (0, validateRequest_1.default)(review_validation_1.reviewValidation.ReviewSchema), (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), review_controller_1.reviewController.updateReview);
router.delete('/:reviewId', (0, auth_1.default)(client_1.UserRoleEnum.CUSTOMER), review_controller_1.reviewController.deleteReview);
exports.reviewRoutes = router;
