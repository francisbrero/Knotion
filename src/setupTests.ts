import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { initializeApp } from 'firebase/app';

// Initialize Firebase for tests
const app = initializeApp({
  projectId: 'knotion-test',
  apiKey: 'fake-api-key',
});

// Extend expect with DOM matchers
expect.extend(matchers as any);

// Reset mocks before each test
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  ...window.location,
  href: '',
  pathname: '/',
  reload: vi.fn(),
}; 