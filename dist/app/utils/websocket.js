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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = void 0;
const ws_1 = require("ws");
const user_service_1 = require("../modules/user/user.service");
const bookings_service_1 = require("../modules/bookings/bookings.service");
const connections = new Map();
function broadcastConnectedUsers() {
    console.log('Broadcasting connectedUsers event'); // Debugging log
    const connectedUserIds = Array.from(connections.entries()).map(([userId, connection]) => ({
        userId,
        latitude: connection.latitude,
        longitude: connection.longitude,
    }));
    const message = JSON.stringify({
        event: 'connectedUsers',
        payload: { connectedUserIds },
    });
    for (const { ws } of connections.values()) {
        ws.send(message);
    }
}
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const data = JSON.parse(message);
            const { type, userId, roomId, latitude, longitude } = data;
            if (userId) {
                const driver = yield user_service_1.UserServices.getUserDetailsFromDB(userId);
                if (!driver) {
                    ws.send(JSON.stringify({
                        message: 'Driver or customer not found',
                    }));
                    return;
                }
            }
            switch (type) {
                case 'joinRoom':
                    if (connections.has(userId)) {
                        const connection = connections.get(userId);
                        if (connection) {
                            connection.roomId = roomId;
                        }
                    }
                    else {
                        connections.set(userId, {
                            ws,
                            roomId,
                            latitude: ((_a = connections.get(userId)) === null || _a === void 0 ? void 0 : _a.latitude) || undefined,
                            longitude: ((_b = connections.get(userId)) === null || _b === void 0 ? void 0 : _b.longitude) || undefined,
                        });
                    }
                    console.log(`Driver ${userId} joined room ${roomId}`);
                    ws.send(JSON.stringify({
                        event: 'joinedRoom',
                        payload: { roomId },
                    }));
                    broadcastConnectedUsers();
                    // Ensure broadcastConnectedUsers is called after a user joins the room
                    console.log('Calling broadcastConnectedUsers from joinRoom');
                    break;
                case 'leaveRoom':
                    if (connections.has(userId)) {
                        connections.delete(userId);
                        console.log('Calling broadcastConnectedUsers from leaveRoom');
                        broadcastConnectedUsers();
                        ws.send(JSON.stringify({
                            event: 'leftRoom',
                            payload: { roomId },
                        }));
                        console.log(`Driver ${userId} left room ${roomId}`);
                    }
                    else {
                        ws.send(JSON.stringify({
                            event: 'error',
                            message: 'Driver not in any room',
                        }));
                    }
                    break;
                case 'updateLocation':
                    if (connections.has(userId)) {
                        const connection = connections.get(userId);
                        if (connection) {
                            connection.latitude = data.latitude;
                            connection.longitude = data.longitude;
                        }
                        console.log('Calling broadcastConnectedUsers from updateLocation for:', userId);
                        // Ensure broadcastConnectedUsers is called after updating location
                        broadcastConnectedUsers();
                        ws.send(JSON.stringify({
                            event: 'locationUpdated',
                            payload: {
                                userId,
                                latitude: data.latitude,
                                longitude: data.longitude,
                            },
                        }));
                    }
                    else {
                        ws.send(JSON.stringify({
                            event: 'error',
                            message: 'Driver not in any room',
                        }));
                    }
                    break;
                case 'uniqueRoomCreated':
                    const bookingId = roomId;
                    const booking = yield bookings_service_1.bookingService.getBookingByIdFromDB2(bookingId);
                    if (!booking) {
                        ws.send(JSON.stringify({
                            event: 'error',
                            message: 'Booking not found',
                        }));
                        return;
                    }
                    const customerId = booking.customerId;
                    const driverId = booking.driverId;
                    if (userId !== customerId && userId !== driverId) {
                        ws.send(JSON.stringify({
                            event: 'error',
                            message: 'User not authorized for this booking',
                        }));
                        return;
                    }
                    connections.set(userId, {
                        ws,
                        roomId,
                        latitude: ((_c = connections.get(userId)) === null || _c === void 0 ? void 0 : _c.latitude) || undefined,
                        longitude: ((_d = connections.get(userId)) === null || _d === void 0 ? void 0 : _d.longitude) || undefined,
                    });
                    console.log(`User ${userId} joined unique room ${roomId}`);
                    ws.send(JSON.stringify({
                        event: 'uniqueRoomCreated',
                        payload: { roomId },
                    }));
                    // Ensure broadcastConnectedUsers is called after a user joins the room
                    console.log('Calling broadcastConnectedUsers from uniqueRoomCreated');
                    broadcastSpecificUsers();
                    break;
                default:
                    ws.send(JSON.stringify({
                        event: 'error',
                        message: 'Unknown message type',
                    }));
            }
        }));
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            connections.forEach((connection, userId) => {
                if (connection.ws === ws) {
                    connections.delete(userId);
                    console.log('Calling broadcastConnectedUsers from close');
                    broadcastConnectedUsers();
                }
            });
        });
        ws.on('error', error => {
            console.error('WebSocket error:', error);
        });
        ws.send('WebSocket connection established');
    });
}
exports.setupWebSocket = setupWebSocket;
function broadcastSpecificUsers() {
    console.log('Broadcasting specificUsers event'); // Debugging log
    const specificUserIds = Array.from(connections.entries()).map(([userId, connection]) => ({
        userId,
        latitude: connection.latitude,
        longitude: connection.longitude,
    }));
    const message = JSON.stringify({
        event: 'specificUsers',
        payload: { specificUserIds },
    });
    for (const { ws } of connections.values()) {
        ws.send(message);
    }
}
