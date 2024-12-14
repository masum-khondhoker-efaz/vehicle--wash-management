"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
const payment_validation_1 = require("./payment.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
// create a new customer with card
router.post('/save-card', (0, auth_1.default)(), (0, validateRequest_1.default)(payment_validation_1.TStripeSaveWithCustomerInfoPayloadSchema), payment_controller_1.PaymentController.saveCardWithCustomerInfo);
// Authorize the customer with the amount and send payment request
router.post('/authorize-payment', (0, validateRequest_1.default)(payment_validation_1.AuthorizedPaymentPayloadSchema), payment_controller_1.PaymentController.authorizedPaymentWithSaveCard);
// Capture the payment request and deduct the amount
router.post('/capture-payment', (0, validateRequest_1.default)(payment_validation_1.capturedPaymentPayloadSchema), payment_controller_1.PaymentController.capturePaymentRequest);
// Save new card to existing customer
router.post('/save-new-card', (0, validateRequest_1.default)(payment_validation_1.saveNewCardWithExistingCustomerPayloadSchema), payment_controller_1.PaymentController.saveNewCardWithExistingCustomer);
// Get all save cards for customer
router.get('/get-cards/:customerId', payment_controller_1.PaymentController.getCustomerSavedCards);
// Delete card from customer
router.delete('/delete-card/:paymentMethodId', payment_controller_1.PaymentController.deleteCardFromCustomer);
// Refund payment to customer
router.post('/refund-payment', (0, validateRequest_1.default)(payment_validation_1.refundPaymentPayloadSchema), payment_controller_1.PaymentController.refundPaymentToCustomer);
exports.PaymentRoutes = router;
