import httpStatus from 'http-status';
import Stripe from 'stripe';
import config from '../../../config';
import { isValidAmount } from '../../utils/isValidAmount';
import { TStripeSaveWithCustomerInfo } from './payment.interface';
import prisma from '../../utils/prisma';
import {
  BookingStatus,
  PaymentStatus,
  ServiceStatus,
  UserRoleEnum,
} from '@prisma/client';
import AppError from '../../errors/AppError';
import { sendNotification } from '../../utils/firebaseAdmin';

// Initialize Stripe with your secret API key
const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2024-11-20.acacia',
});

// Step 1: Create a Customer and Save the Card
const saveCardWithCustomerInfoIntoStripe = async (
  payload: TStripeSaveWithCustomerInfo,
  userId: string,
) => {
  try {
    const { user, paymentMethodId, address } = payload;

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      name: user.name,
      email: user.email,
      address: {
        city: address.city,
        postal_code: address.postal_code,
        country: address.country,
      },
    });

    // Attach PaymentMethod to the Customer
    const attach = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set PaymentMethod as Default
    const updateCustomer = await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log({ updateCustomer });

    // update profile with customerId
    await prisma.customer.update({
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
  } catch (error: any) {
    throw Error(error.message);
  }
};

// Step 2: Authorize the Payment Using Saved Card
const authorizedPaymentWithSaveCardFromStripe = async (
  userId: string,
  payload: {
    paymentMethodId: string;
    bookingId: string;
  },
) => {
  const { paymentMethodId, bookingId } = payload;

  // Retrieve the Customer from the database
  const customerDetails = await prisma.user.findUnique({
    where: {
      id: userId,
      role: UserRoleEnum.CUSTOMER,
    },
    include: {
      customer: {
        select: {
          customerId: true,
        },
      },
    },
  });

  if (!customerDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Customer not found');
  }

  // Retrieve the booking details
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId,
      customerId: userId,
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking not found');
  }

  let customerId = customerDetails.customer[0]?.customerId;

  // If the customerId doesn't exist, create a new Stripe customer
  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: customerDetails.email ? customerDetails.email : (() => { throw new AppError(httpStatus.BAD_REQUEST, 'Email not found'); })(),
    });

    // Update the database with the new Stripe customer ID
    await prisma.customer.update({
      where: { userId: userId },
      data: { customerId: stripeCustomer.id },
    });

    customerId = stripeCustomer.id; // Use the new customerId
  }

  // Create a PaymentIntent with the specified PaymentMethod
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount * 100), // Convert to cents
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    capture_method: 'automatic', // Authorize the payment with capturing
  });

  // Handle successful payment
  if (paymentIntent.status === 'succeeded') {
    // Save payment information to the database
    const payment = await prisma.payment.create({
      data: {
        paymentId: paymentIntent.id,
        customerId: customerId,
        paymentAmount: booking.totalAmount,
        paymentDate: new Date(),
        booking: {
          connect: { id: bookingId },
        },
      },
    });

    // Update the booking status
    await prisma.bookings.update({
      where: { id: bookingId },
      data: {
        paymentId: payment.id,
        paymentStatus: PaymentStatus.COMPLETED,
        bookingStatus: BookingStatus.PENDING,
        serviceDate: new Date(),
      },
    });

    // Optionally send a notification
  //   const fcmToken = await prisma.user.findUnique({
  //     where: { id: userId },
  //     select: { fcmToken: true },
  //   });

  //   if (fcmToken?.fcmToken) {
  //     await sendNotification(
  //       fcmToken.fcmToken,
  //       'Payment Successful',
  //       'Your payment has been processed successfully.',
  //     );
  //   }
   }

  return paymentIntent;
};


// Step 3: Capture the Payment
const capturePaymentRequestToStripe = async (payload: {
  paymentIntentId: string;
}) => {
  try {
    const { paymentIntentId } = payload;

    // Capture the authorized payment using the PaymentIntent ID
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return paymentIntent;
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// New Route: Save a New Card for Existing Customer
const saveNewCardWithExistingCustomerIntoStripe = async (payload: {
  customerId: string;
  paymentMethodId: string;
}) => {
  try {
    const { customerId, paymentMethodId } = payload;

    // Attach the new PaymentMethod to the existing Customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Optionally, set the new PaymentMethod as the default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      customerId: customerId,
      paymentMethodId: paymentMethodId,
    };
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

const getCustomerSavedCardsFromStripe = async (customerId: string) => {
  try {
    // List all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return { paymentMethods: paymentMethods.data };
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// Delete a card from a customer in the stripe
const deleteCardFromCustomer = async (paymentMethodId: string) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return { message: 'Card deleted successfully' };
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// Refund amount to customer in the stripe
const refundPaymentToCustomer = async (payload: {
  paymentIntentId: string;
}) => {
  try {
    // Refund the payment intent
    const refund = await stripe.refunds.create({
      payment_intent: payload?.paymentIntentId,
    });

    return refund;
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// Service function for creating a PaymentIntent
const createPaymentIntentService = async (payload: { amount: number }) => {
  if (!payload.amount) {
    throw new AppError(httpStatus.CONFLICT, 'Amount is required');
  }

  if (!isValidAmount(payload.amount)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Amount '${payload.amount}' is not a valid amount`,
    );
  }

  // Create a PaymentIntent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: payload?.amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true, // Enable automatic payment methods like cards, Apple Pay, Google Pay
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
  };
};

const getCustomerDetailsFromStripe = async (customerId: string) => {
  try {
    // Retrieve the customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId);

    return customer;
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_FOUND, error.message);
  }
};

const getAllCustomersFromStripe = async () => {
  try {
    // Retrieve all customers from Stripe
    const customers = await stripe.customers.list({
      limit: 2,
    });

    return customers;
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

export const StripeServices = {
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
