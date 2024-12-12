import express from 'express';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { PaymentController } from './payment.controller';

const router = express.Router();


import {
  AuthorizedPaymentPayloadSchema,
  capturedPaymentPayloadSchema,
  refundPaymentPayloadSchema,
  saveNewCardWithExistingCustomerPayloadSchema,
  TStripeSaveWithCustomerInfoPayloadSchema,
} from './payment.validation';
import validateRequest from '../../middlewares/validateRequest';


// create a new customer with card
router.post(
  '/save-card',
  auth(),
  validateRequest(TStripeSaveWithCustomerInfoPayloadSchema),
  PaymentController.saveCardWithCustomerInfo,
);

// Authorize the customer with the amount and send payment request
router.post(
  '/authorize-payment',
  validateRequest(AuthorizedPaymentPayloadSchema),
  PaymentController.authorizedPaymentWithSaveCard,
);

// Capture the payment request and deduct the amount
router.post(
  '/capture-payment',
  validateRequest(capturedPaymentPayloadSchema),
  PaymentController.capturePaymentRequest,
);

// Save new card to existing customer
router.post(
  '/save-new-card',
  validateRequest(saveNewCardWithExistingCustomerPayloadSchema),
  PaymentController.saveNewCardWithExistingCustomer,
);

// Get all save cards for customer
router.get('/get-cards/:customerId', PaymentController.getCustomerSavedCards);

// Delete card from customer
router.delete(
  '/delete-card/:paymentMethodId',
  PaymentController.deleteCardFromCustomer,
);

// Refund payment to customer
router.post(
  '/refund-payment',
  validateRequest(refundPaymentPayloadSchema),
  PaymentController.refundPaymentToCustomer,
);



export const PaymentRoutes = router;
