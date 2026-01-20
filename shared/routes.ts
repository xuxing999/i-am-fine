import { z } from 'zod';
import { insertUserSchema, users } from './schema';

export * from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Returns null if not logged in
      },
    },
  },
  user: {
    updateProfile: {
      method: 'PUT' as const,
      path: '/api/user/profile',
      input: insertUserSchema.partial().omit({ username: true, password: true }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    checkIn: {
      method: 'POST' as const,
      path: '/api/check-in',
      responses: {
        200: z.object({ success: z.boolean(), timestamp: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  public: {
    status: {
      method: 'GET' as const,
      path: '/api/status/:username',
      responses: {
        200: z.object({
          displayName: z.string(),
          lastCheckInAt: z.string().nullable(),
          isSafe: z.boolean(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
