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
const driver_service_1 = require("../modules/driver/driver.service");
const connections = new Map();
const broadcastStatusUpdate = (userId, inOnline, latitude, longitude) => {
    const message = JSON.stringify({
        event: 'statusUpdate',
        payload: { userId, inOnline, latitude, longitude },
    });
    console.log(message);
    connections.forEach(connection => {
        connection.ws.send(message);
    });
};
const broadcastLocationUpdate = (location) => {
    const message = JSON.stringify({
        event: 'locationUpdate',
        payload: { location },
    });
    connections.forEach(connection => {
        connection.ws.send(message);
    });
};
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = JSON.parse(message);
                // Handle active status updates
                if (data.event === 'updateStatus') {
                    const { userId, inOnline, latitude, longitude } = data.payload;
                    connections.set(userId, { ws, inOnline, latitude, longitude });
                    yield driver_service_1.driverService.updateOnlineStatusIntoDB(userId, data.payload);
                    broadcastStatusUpdate(userId, inOnline, latitude, longitude);
                }
                // Handle location updates
                if (data.event === 'locationUpdate') {
                    const { userId } = data.payload;
                    connections.set(userId, { ws });
                    const getLocation = yield driver_service_1.driverService.getDriverLiveLocation(userId);
                    if (getLocation.latitude !== null && getLocation.longitude !== null) {
                        broadcastLocationUpdate({
                            latitude: getLocation.latitude,
                            longitude: getLocation.longitude
                        });
                    }
                    else {
                        console.error('Invalid location data:', getLocation);
                    }
                }
            }
            catch (error) {
                console.error('Invalid WebSocket message:', message);
            }
        }));
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            connections.forEach((connection, userId) => {
                if (connection.ws === ws) {
                    connections.delete(userId);
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
