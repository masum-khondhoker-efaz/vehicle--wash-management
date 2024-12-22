"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeServices = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../../config"));
const isValidAmount_1 = require("../../utils/isValidAmount");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
// Initialize Stripe with your secret API key
const stripe = new stripe_1.default(config_1.default.stripe.stripe_secret_key, {
    apiVersion: '2024-11-20.acacia',
});
// Step 1: Create a Customer and Save the Card
const saveCardWithCustomerInfoIntoStripe = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, paymentMethodId, address } = payload;
        // Create a new Stripe customer
        const customer = yield stripe.customers.create({
            name: user.name,
            email: user.email,
            address: {
                city: address.city,
                postal_code: address.postal_code,
                country: address.country,
            },
        });
        // Attach PaymentMethod to the Customer
        const attach = yield stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
        });
        // Set PaymentMethod as Default
        const updateCustomer = yield stripe.customers.update(customer.id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        console.log({ updateCustomer });
        // update profile with customerId
        yield prisma_1.default.customer.update({
            where: {
                userId: userId,
            },
            data: {
                customerId: customer.id,
            },
        });
        return {
            customerId: customer.id,
            paymentMethodId: paymentMethodId,
        };
    }
    catch (error) {
        throw Error(error.message);
    }
});
// Step 2: Authorize the Payment Using Saved Card
const authorizedPaymentWithSaveCardFromStripe = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, paymentMethodId, amount, bookingId } = payload;
        if (!(0, isValidAmount_1.isValidAmount)(amount)) {
            throw new AppError(
              httpStatus.CONFLICT,
              `Amount '${amount}' is not a valid amount`,
            );
        }
        // Create a PaymentIntent with the specified PaymentMethod
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            capture_method: 'automatic', // Authorize the payment with capturing
        });
        if (paymentIntent.status === 'succeeded') {
            const payment = yield prisma_1.default.payment.create({
                data: {
                    paymentId: paymentIntent.id,
                    customerId: customerId,
                    paymentAmount: amount,
                    paymentDate: new Date(),
                },
            });
            const booking = yield prisma_1.default.bookings.update({
                where: {
                    id: bookingId,
                },
                data: {
                    paymentId: payment.id,
                    paymentStatus: client_1.PaymentStatus.COMPLETED,
                    serviceStatus: client_1.ServiceStatus.IN_ROUTE,
                    bookingStatus: client_1.BookingStatus.ACCEPTED,
                    serviceDate: new Date(),
                },
            });
        }
        return paymentIntent;
    }
    catch (error) {
        throw new AppError(httpStatus.CONFLICT, error.message);
    }
});
// Step 3: Capture the Payment
const capturePaymentRequestToStripe = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentIntentId } = payload;
        // Capture the authorized payment using the PaymentIntent ID
        const paymentIntent = yield stripe.paymentIntents.capture(paymentIntentId);
        return paymentIntent;
    }
    catch (error) {
        throw new AppError(httpStatus.CONFLICT, error.message);
    }
});
// New Route: Save a New Card for Existing Customer
const saveNewCardWithExistingCustomerIntoStripe = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, paymentMethodId } = payload;
        // Attach the new PaymentMethod to the existing Customer
        yield stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        // Optionally, set the new PaymentMethod as the default
        yield stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        return {
            customerId: customerId,
            paymentMethodId: paymentMethodId,
        };
    }
    catch (error) {
        throw new AppError(httpStatus.CONFLICT, error.message);
    }
});
const getCustomerSavedCardsFromStripe = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // List all payment methods for the customer
        const paymentMethods = yield stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return { paymentMethods: paymentMethods.data };
    }
    catch (error) {
        throw new AppError(httpStatus.CONFLICT, error.message);
    }
});
// Delete a card from a customer in the stripe
const deleteCardFromCustomer = (paymentMethodId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield stripe.paymentMethods.detach(paymentMethodId);
        return { message: 'Card deleted successfully' };
    }
    catch (error) {
        throw new AppError(httpStatus.CONFLICT, error.message);
    }
});
// Refund amount to customer in the stripe
const refundPaymentToCustomer = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Refund the payment intent
        const refund = yield stripe.refunds.create({
            payment_intent: payload === null || payload === void 0 ? void 0 : payload.paymentIntentId,
        });
        return refund;
    }
    catch (error) {
        throw new AppError(httpStatus.CONFLICT, error.message);
    }
});
// Service function for creating a PaymentIntent
const createPaymentIntentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.amount) {
        throw new AppError(httpStatus.CONFLICT, 'Amount is required');
    }
    if (!(0, isValidAmount_1.isValidAmount)(payload.amount)) {
        throw new AppError(
          httpStatus.CONFLICT,
          `Amount '${payload.amount}' is not a valid amount`,
        );
    }
    // Create a PaymentIntent with Stripe
    const paymentIntent = yield stripe.paymentIntents.create({
        amount: payload === null || payload === void 0 ? void 0 : payload.amount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true, // Enable automatic payment methods like cards, Apple Pay, Google Pay
        },
    });
    return {
        clientSecret: paymentIntent.client_secret,
        dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    };
});
const getCustomerDetailsFromStripe = customerId =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      // Retrieve the customer details from Stripe
      const customer = yield stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      throw new AppError(httpStatus.CONFLICT, error.message);
    }
  });
const getAllCustomersFromStripe = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      // Retrieve all customers from Stripe
      const customers = yield stripe.customers.list({
        limit: 2,
      });
      return customers;
    } catch (error) {
      throw new AppError(httpStatus.CONFLICT, error.message);
    }
  });
exports.StripeServices = {
  saveCardWithCustomerInfoIntoStripe,
  authorizedPaymentWithSaveCardFromStripe,
  capturePaymentRequestToStripe,
  saveNewCardWithExistingCustomerIntoStripe,
  getCustomerSavedCardsFromStripe,
  deleteCardFromCustomer,
  refundPaymentToCustomer,
  createPaymentIntentService,
  getCustomerDetailsFromStripe,
  getAllCustomersFromStripe,
};
