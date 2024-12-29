import admin from 'firebase-admin';
import { serviceAccount } from './serviceAccount';

// Replace with the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

export default admin;