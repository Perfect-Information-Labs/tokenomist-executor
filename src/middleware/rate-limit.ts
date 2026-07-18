import type { Context, Next } from 'hono';

type RateLimiterBinding = 'RATE_LIMITER_WRITE' | 'RATE_LIMITER_READ' | 'RATE_LIMITER_TIER_DETAILS';

export function rateLimit(binding: RateLimiterBinding) {
  return async (c: Context<{ Bindings: CloudflareBindings  }>, next: Next) => {
    const key = c.req.header('cf-connecting-ip') ?? 'unknown';
    const limiter = c.env[binding];
    const { success } = await limiter.limit({ key });

    if (!success) {
      return c.json(
        { error: 'RateLimited', message: 'Too many requests, try again shortly' },
        429 as any
      );
    }

    await next();
  };
}