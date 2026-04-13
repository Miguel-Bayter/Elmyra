// S0-TEST-01 — Verify test environment is correctly configured
describe('Test environment', () => {
  it('localStorage mock is clean at start of each test', () => {
    localStorage.setItem('test-key', 'value');
    expect(localStorage.getItem('test-key')).toBe('value');
  });

  it('localStorage is reset between tests', () => {
    // If previous test set a key, it should be gone here
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('crypto.randomUUID returns valid UUID format', () => {
    const uuid = crypto.randomUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
