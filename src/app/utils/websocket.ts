import WebSocket, { WebSocketServer } from 'ws';
import { UserServices } from '../modules/user/user.service';
import { bookingService } from '../modules/bookings/bookings.service';

const connections = new Map<
  string,
  { ws: WebSocket; roomId: string; latitude?: number; longitude?: number }
>();

function broadcastConnectedUsers() {
  console.log('Broadcasting connectedUsers event'); // Debugging log

  const connectedUserIds = Array.from(connections.entries()).map(
    ([userId, connection]) => ({
      userId,
      latitude: connection.latitude,
      longitude: connection.longitude,
    }),
  );

  const message = JSON.stringify({
    event: 'connectedUsers',
    payload: { connectedUserIds },
  });

  for (const { ws } of connections.values()) {
    ws.send(message);
  }
}

export function setupWebSocket(server: any): void {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message: string) => {
      const data = JSON.parse(message);
      const { type, userId, roomId, latitude, longitude } = data;

      if (userId) {
        const driver = await UserServices.getUserDetailsFromDB(userId);

        if (!driver) {
          ws.send(
            JSON.stringify({
              message: 'Driver or customer not found',
            }),
          );
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
          } else {
            connections.set(userId, {
              ws,
              roomId,
              latitude: connections.get(userId)?.latitude || undefined,
              longitude: connections.get(userId)?.longitude || undefined,
            });
          }

          console.log(`Driver ${userId} joined room ${roomId}`);
          
          ws.send(
            JSON.stringify({
              event: 'joinedRoom',
              payload: { roomId },
            }),
          );
          
          broadcastConnectedUsers();
          // Ensure broadcastConnectedUsers is called after a user joins the room
          console.log('Calling broadcastConnectedUsers from joinRoom');
          break;

        case 'leaveRoom':
          if (connections.has(userId)) {
            connections.delete(userId);
            console.log('Calling broadcastConnectedUsers from leaveRoom');
            broadcastConnectedUsers();

            ws.send(
              JSON.stringify({
                event: 'leftRoom',
                payload: { roomId },
              }),
            );
            console.log(`Driver ${userId} left room ${roomId}`);
          } else {
            ws.send(
              JSON.stringify({
                event: 'error',
                message: 'Driver not in any room',
              }),
            );
          }
          break;

        case 'updateLocation':
          if (connections.has(userId)) {
            const connection = connections.get(userId);
            if (connection) {
              connection.latitude = data.latitude;
              connection.longitude = data.longitude;
            }

            console.log(
              'Calling broadcastConnectedUsers from updateLocation for:',
              userId,
            );

            // Ensure broadcastConnectedUsers is called after updating location
            broadcastConnectedUsers();

            ws.send(
              JSON.stringify({
                event: 'locationUpdated',
                payload: {
                  userId,
                  latitude: data.latitude,
                  longitude: data.longitude,
                },
              }),
            );
          } else {
            ws.send(
              JSON.stringify({
                event: 'error',
                message: 'Driver not in any room',
              }),
            );
          }
          break;

        case 'uniqueRoomCreated':
          
            const bookingId = roomId;
            const booking = await bookingService.getBookingByIdFromDB2( bookingId);

            if (!booking) {
            ws.send(
              JSON.stringify({
              event: 'error',
              message: 'Booking not found',
              }),
            );
            return;
            }

            const customerId = booking.customerId;
            const driverId = booking.driverId;

            if (userId !== customerId && userId !== driverId) {
            ws.send(
              JSON.stringify({
              event: 'error',
              message: 'User not authorized for this booking',
              }),
            );
            return;
            }

            connections.set(userId, {
            ws,
            roomId,
            latitude: connections.get(userId)?.latitude || undefined,
            longitude: connections.get(userId)?.longitude || undefined,
            });

            console.log(`User ${userId} joined unique room ${roomId}`);

            ws.send(
            JSON.stringify({
              event: 'uniqueRoomCreated',
              payload: { roomId },
            }),
            );

            // Ensure broadcastConnectedUsers is called after a user joins the room
            console.log('Calling broadcastConnectedUsers from uniqueRoomCreated');
            broadcastSpecificUsers();
            break;





        default:
          ws.send(
            JSON.stringify({
              event: 'error',
              message: 'Unknown message type',
            }),
          );
      }
    });

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
function broadcastSpecificUsers() {
  console.log('Broadcasting specificUsers event'); // Debugging log

  const specificUserIds = Array.from(connections.entries()).map(
    ([userId, connection]) => ({
      userId,
      latitude: connection.latitude,
      longitude: connection.longitude,
    }),
  );

  const message = JSON.stringify({
    event: 'specificUsers',
    payload: { specificUserIds },
  });

  for (const { ws } of connections.values()) {
    ws.send(message);
  }
}


