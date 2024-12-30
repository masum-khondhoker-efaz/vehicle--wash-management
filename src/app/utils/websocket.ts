import WebSocket, { WebSocketServer } from 'ws';
import { driverService } from '../modules/driver/driver.service';
import admin from './firebaseAdmin';
import { adminService } from '../modules/admin/admin.service';

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

  console.log(message);

  connections.forEach(connection => {
    connection.ws.send(message);
  });
};

const getDriverList = async () => {
  const drivers = await adminService.getDriverList(0, 100); // Fetch first 100 drivers for simplicity
  const onlineDrivers = drivers.formattedDrivers.map(driver => ({
    id: driver.id,
    fullName: driver.fullName,
    email: driver.email,
    phoneNumber: driver.phoneNumber,
    joinDate: driver.joinDate,
    profileImage: driver.profileImage,
    status: driver.status,
    role: driver.role,
    totalBookingsCompleted: driver.totalBookingsCompleted,
    inOnline: connections.has(driver.id),
    latitude: connections.get(driver.id)?.latitude || null,
    longitude: connections.get(driver.id)?.longitude || null,
  }));

  return onlineDrivers;
};

const broadcastGetDriverList = async () => {
  const driverList = await getDriverList();
  const message = JSON.stringify({
    event: 'driverList',
    payload: driverList,
  });

  connections.forEach(connection => {
    connection.ws.send(message);
  });
};

const broadcastLocationUpdate = (location: {
  latitude: number;
  longitude: number;
}) => {
  const message = JSON.stringify({
    event: 'locationUpdate',
    payload: { location },
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
          const { userId, latitude, longitude } = data.payload;
          connections.set(userId, { ws });
          const getLocation = await driverService.getDriverLiveLocation(userId);
          if (getLocation.latitude !== null && getLocation.longitude !== null) {
            broadcastLocationUpdate({
              latitude: getLocation.latitude!,
              longitude: getLocation.longitude!,
            });
            
          } else {
            console.error('Invalid location data:', getLocation);
          }
        }

        // Handle get driver list
        if (data.event === 'getDriverList') {
          const { userId } = data.payload;
          connections.set(userId, { ws });
          
          await broadcastGetDriverList();
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
