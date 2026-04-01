import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Mock Firebase Auth
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User'
};

const mockAuth = {
  currentUser: null,
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
};

vi.mock('firebase/auth', async () => {
  return {
    getAuth: vi.fn(() => mockAuth),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        user: mockUser,
        credential: { accessToken: 'mock-token' }
      });
    }),
    signOut: vi.fn().mockResolvedValue(undefined),
    onAuthStateChanged: vi.fn((auth, callback) => {
      mockAuth.onAuthStateChanged = callback;
      return () => {};
    }),
    connectAuthEmulator: vi.fn()
  };
});

import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  getAuth
} from 'firebase/auth';
import { setupTestEnvironment, cleanupTestEnvironment } from '../utils/firebase';

describe('Google Authentication Flow', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
    const auth = getAuth();
    await signOut(auth);
  });

  it('should successfully sign in with Google', async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user.uid).toBe(mockUser.uid);
  });

  it('should handle sign in errors', async () => {
    const auth = getAuth();
    vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('Sign in failed'));

    const provider = new GoogleAuthProvider();
    await expect(signInWithPopup(auth, provider))
      .rejects
      .toThrow('Sign in failed');
  });

  it('should persist auth state', async () => {
    const auth = getAuth();

    // Subscribe to auth state changes
    const authStatePromise = new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          expect(user.uid).toBe(mockUser.uid);
          expect(user.email).toBe(mockUser.email);
          resolve();
        }
      });
    });

    // Simulate auth state change
    mockAuth.onAuthStateChanged(mockUser);

    await authStatePromise;
  });

  it('should successfully sign out', async () => {
    const auth = getAuth();
    await expect(signOut(auth)).resolves.not.toThrow();
  });
}); 