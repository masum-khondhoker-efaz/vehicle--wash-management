import WebSocket, { WebSocketServer } from 'ws';
import { driverService } from '../modules/driver/driver.service';

const connections = new Map();

const broadcastStatusUpdate = (
  userId: string,
  inOnline: boolean,
  latitude: number,
  longitude: number,
) => {
  const message = JSON.stringify({
    event: 'statusUpdate',
    payload: { userId, inOnline, latitude, longitude },
  });

  connections.forEach(connection => {
    connection.ws.send(message);
  });
};

const broadcastLocationUpdate = (
  userId: string,
  location: { latitude: number; longitude: number },
) => {
  const message = JSON.stringify({
    event: 'locationUpdate',
    payload: { userId, location },
  });

  connections.forEach(connection => {
    connection.ws.send(message);
  });
};

export function setupWebSocket(server: any): void {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        // Handle active status updates
        if (data.event === 'updateStatus') {
          const { userId, inOnline, latitude, longitude } = data.payload;
          connections.set(userId, { ws, inOnline, latitude, longitude });
          await driverService.updateOnlineStatusIntoDB(userId, data.payload);
          broadcastStatusUpdate(userId, inOnline, latitude, longitude);
        }

        // Handle location updates
        if (data.event === 'locationUpdate') {
          const { userId, location } = data.payload;
          connections.set(userId, { ws, location });
          await driverService.updateOnlineStatusIntoDB(userId, {
            status: true,
            ...location,
          });
          broadcastLocationUpdate(userId, location);
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', message);
      }
    });

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
