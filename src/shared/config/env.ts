import { z } from 'zod';

// Zod-validated env vars — R6: no secrets, all validated at startup
const envSchema = z.object({
  VITE_APP_VERSION: z.string().optional().default('1.0.0'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(import.meta.env);
