"use strict";
// Send notification to a single user
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.notificationServices = void 0;
const http_status_1 = __importStar(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const firebaseAdmin_1 = __importDefault(require("../../utils/firebaseAdmin"));
const sendSingleNotification = (userId, body) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    // if (!user?.fcmToken) {
    //   throw new AppError(httpStatus.NOT_FOUND, 'User not found with FCM token');
    // }
    const message = {
        notification: {
            title: body.title,
            body: body.body,
        },
        // token: user.fcmToken,
    };
    // Attempt to send the notification first, then store in DB if successful
    // console.log(req.params.userId);
    // console.log(user.fcmToken);
    // const response = await admin.messaging().send(message);
    // console.log('object');
    // If the notification is sent successfully, save it to the database
    const notification = yield prisma_1.default.notification.create({
        data: {
            userId: userId,
            title: body.title,
            body: body.body,
            isRead: false, // Default to unread
            isClicked: false, // Default to not clicked
        },
    });
    if (!notification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Notification not found');
    }
    return notification; // Return the response from FCM
});
// Send notifications to all users with valid FCM tokens
const sendNotifications1 = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany({
        where: {
            fcmToken: {
                not: null, // Ensure the token is not null
            },
        },
        select: {
            id: true,
            fcmToken: true,
        },
    });
    if (!users || users.length === 0) {
        throw new AppError_1.default(404, 'No users found with FCM tokens');
    }
    const fcmTokens = users.map(user => user.fcmToken);
    const message = {
        notification: {
            title: req.body.title,
            body: req.body.body,
        },
        tokens: fcmTokens,
    };
    const response = yield firebaseAdmin_1.default.messaging().sendEachForMulticast(message);
    // Find indices of successful responses
    const successIndices = response.responses
        .map((res, idx) => (res.success ? idx : null))
        .filter(idx => idx !== null);
    // Filter users by success indices
    const successfulUsers = successIndices.map(idx => users[idx]);
    // Prepare notifications data for only successfully notified users
    const notificationData = successfulUsers.map(user => ({
        receiverId: user.id,
        title: req.body.title,
        body: req.body.body,
    }));
    /*
  
    // Save notifications for successfully notified users
    await prisma.notifications.createMany({
      data: notificationData,
    });
  */
    // Collect failed tokens
    const failedTokens = response.responses
        .map((res, idx) => (!res.success ? fcmTokens[idx] : null))
        .filter(token => token !== null);
    return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
    };
});
const sendNotifications = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany({
        where: {
            fcmToken: {
                not: null, // Ensure the token is not null
            },
        },
        select: {
            id: true,
            fcmToken: true,
        },
    });
    if (!users || users.length === 0) {
        throw new AppError_1.default(http_status_1.NOT_FOUND, 'No users found with FCM tokens');
    }
    const fcmTokens = users.map(user => user.fcmToken);
    const message = {
        notification: {
            title: req.body.title,
            body: req.body.body,
        },
        tokens: fcmTokens,
    };
    // Send the notification to each device using FCM
    const response = yield firebaseAdmin_1.default.messaging().sendEachForMulticast(message);
    // Find indices of successful responses
    const successIndices = response.responses
        .map((res, idx) => (res.success ? idx : null))
        .filter(idx => idx !== null);
    // Filter users by success indices
    const successfulUsers = successIndices.map(idx => users[idx]);
    // Prepare notifications data for only successfully notified users
    const notificationData = successfulUsers.map(user => ({
        userId: user.id, // userId of the notified user
        title: req.body.title, // Notification title
        message: req.body.body, // Notification body content
        body: req.body.body, // Body of the notification
        isRead: false, // Default value for unread notifications
        isClicked: false, // Default value for un-clicked notifications
    }));
    // Save notifications for successfully notified users
    yield prisma_1.default.notification.createMany({
        data: notificationData,
    });
    // Collect failed tokens
    const failedTokens = response.responses
        .map((res, idx) => (!res.success ? fcmTokens[idx] : null))
        .filter(token => token !== null);
    return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
    };
});
//TODO  update getNotificationsFromDB to get notifications
const getNotificationsFromDB1 = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield prisma_1.default.notification.findMany({
        where: {
            userId: req.user.id,
        },
        orderBy: { createdAt: 'desc' },
    });
    if (notifications.length === 0) {
        throw new AppError_1.default(http_status_1.NOT_FOUND, 'No notifications found for the user');
    }
    return notifications;
});
const getNotificationsFromDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield prisma_1.default.notification.findMany({
        where: {
            userId: req.user.id,
        },
        orderBy: { createdAt: 'desc' },
    });
    if (notifications.length === 0) {
        return { message: 'No notifications found for the user' };
    }
    return notifications;
});
const getSingleNotificationFromDB = (req, notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.default.notification.findFirst({
        where: {
            id: notificationId,
            userId: req.user.id,
        },
    });
    if (!notification) {
        throw new AppError_1.default(http_status_1.NOT_FOUND, 'Notification not found for the user');
    }
    return notification;
});
exports.notificationServices = {
    sendSingleNotification,
    sendNotifications,
    getNotificationsFromDB,
    getSingleNotificationFromDB,
};
