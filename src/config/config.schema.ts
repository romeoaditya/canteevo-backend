import { z } from 'zod';

export const configSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z
      .string()
      .default('3000')
      .transform(Number)
      .pipe(z.number().positive()),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRATION: z.string().default('24h'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
  })
  .passthrough();

export type Config = z.infer<typeof configSchema>;
