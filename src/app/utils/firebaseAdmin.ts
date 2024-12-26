import admin from 'firebase-admin';
import { serviceAccount } from './serviceAccount';

// Replace with the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const sendNotification = async (
  token: string,
  title: string,
  body: string,
) => {
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    await admin.messaging().send(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};