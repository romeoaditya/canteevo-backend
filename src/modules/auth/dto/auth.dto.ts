import { z } from 'zod';

export const loginDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

export const registerDtoSchema = z.object({
  nis: z.string().min(1, 'NIS is required'),
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterDto = z.infer<typeof registerDtoSchema>;

export interface JwtPayload {
  sub: string;
  email: string;
}
