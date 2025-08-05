import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app';
import serviceAccount from '../../firebase.json';

export const firebaseApp = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});
