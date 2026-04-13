import { companionNameSchema, companionStateSchema, statValueSchema } from './schemas';

// ─── companionNameSchema ──────────────────────────────────────────────────────
describe('companionNameSchema', () => {
  // Valid cases
  it('accepts a simple name', () => {
    expect(companionNameSchema.safeParse('Luna').success).toBe(true);
  });

  it('accepts names with accented characters (ES locale support)', () => {
    expect(companionNameSchema.safeParse('Café').success).toBe(true);
    expect(companionNameSchema.safeParse('Ñoño').success).toBe(true);
    expect(companionNameSchema.safeParse('Müller').success).toBe(true);
  });

  it('accepts names with apostrophes', () => {
    expect(companionNameSchema.safeParse("O'Brien").success).toBe(true);
  });

  it('accepts names with hyphens', () => {
    expect(companionNameSchema.safeParse('Little-Star').success).toBe(true);
  });

  it('accepts names with numbers', () => {
    expect(companionNameSchema.safeParse('Luna2').success).toBe(true);
  });

  it('trims leading and trailing whitespace', () => {
    const result = companionNameSchema.safeParse('  Luna  ');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('Luna');
  });

  it('accepts name at maximum length (24 chars)', () => {
    expect(companionNameSchema.safeParse('A'.repeat(24)).success).toBe(true);
  });

  // Invalid cases
  it('rejects empty string', () => {
    expect(companionNameSchema.safeParse('').success).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(companionNameSchema.safeParse('   ').success).toBe(false);
  });

  it('rejects name longer than 24 chars', () => {
    expect(companionNameSchema.safeParse('A'.repeat(25)).success).toBe(false);
  });

  // Security tests — XSS prevention
  it('SECURITY: rejects XSS script tag injection', () => {
    expect(companionNameSchema.safeParse('<script>alert(1)</script>').success).toBe(false);
  });

  it('SECURITY: rejects HTML attribute injection', () => {
    expect(companionNameSchema.safeParse('<img src=x onerror=alert(1)>').success).toBe(false);
  });

  it('SECURITY: rejects javascript: URI protocol', () => {
    expect(companionNameSchema.safeParse('javascript:alert(1)').success).toBe(false);
  });

  it('SECURITY: rejects SQL injection attempt', () => {
    expect(companionNameSchema.safeParse("'; DROP TABLE").success).toBe(false);
  });

  it('SECURITY: rejects HTML entity injection', () => {
    expect(companionNameSchema.safeParse('&lt;script&gt;').success).toBe(false);
  });
});

// ─── statValueSchema ──────────────────────────────────────────────────────────
describe('statValueSchema', () => {
  it('accepts 0', () => expect(statValueSchema.safeParse(0).success).toBe(true));
  it('accepts 100', () => expect(statValueSchema.safeParse(100).success).toBe(true));
  it('accepts 50', () => expect(statValueSchema.safeParse(50).success).toBe(true));
  it('rejects -1', () => expect(statValueSchema.safeParse(-1).success).toBe(false));
  it('rejects 101', () => expect(statValueSchema.safeParse(101).success).toBe(false));
  it('rejects decimal values', () => expect(statValueSchema.safeParse(50.5).success).toBe(false));
  it('rejects string', () => expect(statValueSchema.safeParse('50').success).toBe(false));
});

// ─── companionStateSchema ─────────────────────────────────────────────────────
describe('companionStateSchema', () => {
  const validState = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Luna',
    nourishment: 80,
    joy: 75,
    energy: 85,
    vitality: 100,
    age: 0,
    stage: 'seedling',
    mood: 'radiant',
    isResting: false,
    isInRestMode: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastUpdatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('accepts a valid complete state', () => {
    expect(companionStateSchema.safeParse(validState).success).toBe(true);
  });

  it('rejects stat values above 100', () => {
    expect(companionStateSchema.safeParse({ ...validState, nourishment: 101 }).success).toBe(false);
  });

  it('rejects negative stat values', () => {
    expect(companionStateSchema.safeParse({ ...validState, joy: -1 }).success).toBe(false);
  });

  it('rejects invalid stage enum value', () => {
    expect(companionStateSchema.safeParse({ ...validState, stage: 'dead' }).success).toBe(false);
  });

  it('rejects invalid mood enum value', () => {
    expect(companionStateSchema.safeParse({ ...validState, mood: 'dead' }).success).toBe(false);
  });

  it('rejects missing required field (id)', () => {
    const withoutId = Object.fromEntries(Object.entries(validState).filter(([k]) => k !== 'id'));
    expect(companionStateSchema.safeParse(withoutId).success).toBe(false);
  });

  it('rejects invalid UUID format for id', () => {
    expect(companionStateSchema.safeParse({ ...validState, id: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects tampered localStorage data (invalid datetime)', () => {
    expect(companionStateSchema.safeParse({ ...validState, createdAt: 'hacked' }).success).toBe(
      false,
    );
  });
});
