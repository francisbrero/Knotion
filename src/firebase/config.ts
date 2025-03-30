import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Import service account credentials
// Note: In production, you might want to use a different path
import serviceAccount from '../serviceAccount.json';

const app = initializeApp({
  credential: cert(serviceAccount as any),
});

export const auth = getAuth(app);
export const db = getFirestore(app); 