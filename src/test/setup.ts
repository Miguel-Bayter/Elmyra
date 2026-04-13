import '@testing-library/jest-dom';

// localStorage mock — persistent within describe, reset between test files
// All security/detect-object-injection suppressions below are safe:
// keys are controlled string arguments from test code, never from user input.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    // eslint-disable-next-line security/detect-object-injection
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      // eslint-disable-next-line security/detect-object-injection
      store[key] = value;
    },
    removeItem: (key: string): void => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, security/detect-object-injection
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      // eslint-disable-next-line security/detect-object-injection
      return Object.keys(store)[index] ?? null;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// crypto.randomUUID mock — not available in jsdom
let uuidCounter = 0;
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: (): string => {
    uuidCounter++;
    return `00000000-0000-4000-8000-${String(uuidCounter).padStart(12, '0')}`;
  },
  configurable: true,
});

// Reset localStorage between each test to prevent state leakage
beforeEach(() => {
  localStorageMock.clear();
});
