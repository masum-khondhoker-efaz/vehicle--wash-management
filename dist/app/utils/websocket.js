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
const bookings_service_1 = require("../modules/bookings/bookings.service");
const user_service_1 = require("../modules/user/user.service");
const connections = new Map();
// const broadcastStatusUpdate = (
//   userId: string,
//   inOnline: boolean,
//   latitude: number,
//   longitude: number,
// ) => {
//   const message = JSON.stringify({
//     event: 'statusUpdate',
//     payload: { userId, inOnline, latitude, longitude },
//   });
//   console.log(message);
//   connections.forEach(connection => {
//     connection.ws.send(message);
//   });
// };
// const getDriverList = async () => {
//   const drivers = await adminService.getDriverList(0, 100); // Fetch first 100 drivers for simplicity
//   const onlineDrivers = drivers.formattedDrivers.map(driver => ({
//     id: driver.id,
//     fullName: driver.fullName,
//     email: driver.email,
//     phoneNumber: driver.phoneNumber,
//     joinDate: driver.joinDate,
//     profileImage: driver.profileImage,
//     status: driver.status,
//     role: driver.role,
//     totalBookingsCompleted: driver.totalBookingsCompleted,
//     inOnline: connections.has(driver.id),
//     latitude: connections.get(driver.id)?.latitude || null,
//     longitude: connections.get(driver.id)?.longitude || null,
//   }));
//   return onlineDrivers;
// };
// const broadcastGetDriverList = async () => {
//   const driverList = await getDriverList();
//   const message = JSON.stringify({
//     event: 'driverList',
//     payload: driverList,
//   });
//   connections.forEach(connection => {
//     connection.ws.send(message);
//   });
// };
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
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
                    if (!connections.has(userId)) {
                        connections.set(userId, { ws, roomId, latitude, longitude });
                    }
                    // Broadcast the updated list of connected users after joining
                    broadcastConnectedUsers();
                    ws.send(JSON.stringify({
                        event: 'joinedRoom',
                        payload: { roomId, userId },
                    }));
                    console.log(`Driver ${userId} joined room ${roomId}`);
                    break;
                case 'leaveRoom':
                    if (connections.has(userId)) {
                        connections.delete(userId);
                        broadcastConnectedUsers(); // Notify all clients
                        ws.send(JSON.stringify({
                            event: 'leftRoom',
                            payload: { roomId: data.roomId },
                        }));
                        console.log(`Driver ${userId} left room ${data.roomId}`);
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
                        // Update driver's location in the connections map
                        const connection = connections.get(userId);
                        if (connection) {
                            connection.latitude = data.latitude;
                            connection.longitude = data.longitude;
                        }
                        broadcastConnected(userId, data.latitude, data.longitude);
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
                // case 'getDriverLiveLocation':
                //   if (connections.has(userId)) {
                //     const connection = connections.get(userId);
                //     broadcastGetDriverLiveLocation({
                //       userId,
                //       latitude: connection?.latitude ?? 0,
                //       longitude: connection?.longitude ?? 0,
                //     });
                //     ws.send(
                //       JSON.stringify({
                //         event: 'driverLiveLocation',
                //         payload: {
                //           userId: userId,
                //           latitude: connection?.latitude || null,
                //           longitude: connection?.longitude || null,
                //         },
                //       }),
                //     );
                //   } else {
                //     ws.send(
                //       JSON.stringify({
                //         event: 'error',
                //         message: 'Driver not in any room',
                //       }),
                //     );
                //   }
                //   break;
                case 'uniqueRoom':
                    if (!connections.has(userId)) {
                        connections.set(userId, { ws, roomId });
                    }
                    let validRoomId;
                    if (connections.has(roomId)) {
                        validRoomId = yield bookings_service_1.bookingService.getBookingByIdFromDB(userId, roomId);
                        if (!validRoomId) {
                            ws.send(JSON.stringify({
                                event: 'error',
                                message: 'This room does not exist',
                            }));
                            return;
                        }
                    }
                    ws.send(JSON.stringify({
                        event: 'personalRoom',
                        payload: {
                            userId: userId,
                            roomId: roomId,
                        },
                    }));
                    // } else {
                    //   ws.send(
                    //     JSON.stringify({
                    //       event: 'error',
                    //       message: 'Driver not in any room',
                    //     }),
                    //   );
                    // }
                    break;
                default:
                    ws.send(JSON.stringify({
                        event: 'error',
                        message: 'Unknown message type',
                    }));
            }
        }));
        // Function to broadcast the updated list of connected users
        function broadcastConnectedUsers() {
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
        function broadcastConnected(userId, latitude, longitude) {
            const message = JSON.stringify({
                event: 'driverLiveLocation',
                payload: { userId, latitude, longitude },
            });
            for (const { ws } of connections.values()) {
                ws.send(message);
            }
        }
        // function broadcastGetDriverLiveLocation(location: {
        //   userId: string;
        //   latitude: number;
        //   longitude: number;
        // }) {
        //   const message = JSON.stringify({
        //     event: 'driverLiveLocation',
        //     payload: { location },
        //   });
        //   for (const { ws } of connections.values()) {
        //     ws.send(message);
        //   }
        // }
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            connections.forEach((connection, userId) => {
                if (connection.ws === ws) {
                    connections.delete(userId);
                    broadcastConnectedUsers(); // Notify all clients of updated list
                }
            });
        });
        ws.on('error', error => {
            console.error('WebSocket error:', error);
        });
        // Do not send connected user IDs when WebSocket connection is established
        ws.send('WebSocket connection established');
    });
}
exports.setupWebSocket = setupWebSocket;
