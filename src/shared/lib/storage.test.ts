import { z } from 'zod';
import { readFromStorage, writeToStorage, deleteAllAppData } from './storage';
import { STORAGE_KEYS } from '@entities/companion/model/constants';

const testSchema = z.object({ value: z.string() });

// ─── readFromStorage ──────────────────────────────────────────────────────────
describe('readFromStorage', () => {
  it('returns null for a missing key', () => {
    expect(readFromStorage('nonexistent-key', testSchema)).toBeNull();
  });

  it('returns validated data for valid stored JSON', () => {
    localStorage.setItem('test-key', JSON.stringify({ value: 'hello' }));
    const result = readFromStorage('test-key', testSchema);
    expect(result).toEqual({ value: 'hello' });
  });

  it('returns null AND removes key for malformed JSON (tampered data)', () => {
    localStorage.setItem('test-key', 'NOT_VALID_JSON{{{');
    const result = readFromStorage('test-key', testSchema);
    expect(result).toBeNull();
    expect(localStorage.getItem('test-key')).toBeNull(); // key was removed
  });

  it('returns null AND removes key when Zod validation fails', () => {
    localStorage.setItem('test-key', JSON.stringify({ value: 123 })); // value should be string
    const result = readFromStorage('test-key', testSchema);
    expect(result).toBeNull();
    expect(localStorage.getItem('test-key')).toBeNull(); // tampered data removed
  });

  it('does not throw for any localStorage content (resilient)', () => {
    localStorage.setItem('test-key', 'null');
    expect(() => readFromStorage('test-key', testSchema)).not.toThrow();
  });
});

// ─── deleteAllAppData ─────────────────────────────────────────────────────────
describe('deleteAllAppData', () => {
  it('removes ALL keys in STORAGE_KEYS', () => {
    // Set all known keys
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.setItem(key, 'test-data');
    });

    deleteAllAppData();

    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  it('does not throw if keys do not exist', () => {
    expect(() => deleteAllAppData()).not.toThrow();
  });

  it('removes the lumina_language key (i18next language preference)', () => {
    localStorage.setItem('lumina_language', 'es');
    deleteAllAppData();
    expect(localStorage.getItem('lumina_language')).toBeNull();
  });

  it('does not remove unrelated keys', () => {
    localStorage.setItem('other-app-key', 'keep-this');
    deleteAllAppData();
    expect(localStorage.getItem('other-app-key')).toBe('keep-this');
  });
});

// ─── writeToStorage + readFromStorage round-trip ─────────────────────────────
describe('write → read round-trip', () => {
  it('stores and retrieves a value correctly', () => {
    writeToStorage('test-key', { value: 'round-trip-test' });
    const result = readFromStorage('test-key', testSchema);
    expect(result).toEqual({ value: 'round-trip-test' });
  });
});
