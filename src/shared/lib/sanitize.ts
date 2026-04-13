// Input sanitization pipeline: raw → trim → remove dangerous chars → truncate → Zod validates
// React JSX auto-escapes, but defense-in-depth requires sanitization at the boundary.

/**
 * Pre-processes companion name input BEFORE Zod validation.
 *
 * Steps:
 * 1. trim()         — removes leading/trailing whitespace
 * 2. replace()      — removes HTML/JS dangerous characters (<>"'`\)
 * 3. slice(0, 30)   — truncates to slightly above schema max (24) to allow Zod to give
 *                     the proper "too long" error message (not a mysterious empty string)
 *
 * Note: This does NOT replace Zod validation — it runs BEFORE it.
 * Zod is the authoritative validator; this is defensive preprocessing.
 */
export const sanitizeCompanionName = (raw: string): string =>
  raw
    .trim()
    .replace(/[<>&"'`\\]/g, '') // Remove HTML/JS injection chars
    .slice(0, 30); // 30 > max 24 → Zod gives "too long" error, not silent truncation

/**
 * Defense-in-depth sanitization for any string rendered to the DOM.
 * React JSX auto-escapes, so this is an extra layer for edge cases
 * (e.g., strings passed to non-JSX APIs like document.title).
 */
export const sanitizeForDisplay = (value: string): string => value.trim().slice(0, 200);
