import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext
} from '@firebase/rules-unit-testing';
import { connectAuthEmulator, getAuth, Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, Firestore } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';

let testEnv: RulesTestEnvironment;
let auth: Auth;
let db: Firestore;

export const setupTestEnvironment = async () => {
  if (testEnv) {
    await cleanupTestEnvironment();
  }

  // Initialize test environment
  testEnv = await initializeTestEnvironment({
    projectId: 'knotion-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    }
  });

  // Clear any existing data
  await testEnv.clearFirestore();

  // Initialize Firebase app
  const app = initializeApp({
    projectId: 'knotion-test',
    apiKey: 'fake-api-key',
  }, 'test-app');

  // Initialize and connect to auth emulator
  auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });

  // Initialize and connect to firestore emulator
  db = getFirestore(app);
  connectFirestoreEmulator(db, 'localhost', 8080);

  return testEnv;
};

export const getTestEnv = () => {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv;
};

export const getTestAuth = () => {
  if (!auth) {
    throw new Error('Auth not initialized');
  }
  return auth;
};

export const getTestDb = () => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

export const cleanupTestEnvironment = async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
    await testEnv.cleanup();
    testEnv = null;
  }
  if (auth) {
    await auth.signOut();
  }
};

export const createAuthenticatedContext = (uid: string, email?: string): RulesTestContext => {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv.authenticatedContext(uid, { email: email || `${uid}@example.com` });
};

export const createUnauthenticatedContext = (): RulesTestContext => {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv.unauthenticatedContext();
}; 