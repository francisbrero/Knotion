import { vi } from 'vitest';
import 'jsdom-global/register';

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
});

// Mock chrome API
(global as any).chrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn()
    },
    sendMessage: vi.fn()
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn()
  }
}; 