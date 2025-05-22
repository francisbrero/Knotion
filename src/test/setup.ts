import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';
import { initializeApp } from 'firebase/app';

// Initialize Firebase for tests
const app = initializeApp({
  projectId: 'knotion-test',
  apiKey: 'fake-api-key',
});

// Extend matchers
expect.extend(matchers);

// Reset mocks
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
}); 