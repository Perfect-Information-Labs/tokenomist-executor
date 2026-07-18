import type { Context } from 'hono';
import {
  InvalidCategoryError,
  InvalidTierError,
  EmptyAddressListError,
  InvalidAddressError,
  EmptyRecipientsError,
  VaultNotFoundError,
} from '../lib/errors';
import type { ErrorResponse } from '../types';

/**
 * Central error handler, wired via app.onError() in index.ts.
 * Maps our known error classes to specific HTTP statuses;
 * anything unrecognized falls through to 500.
 */
export function errorHandler(err: Error, c: Context) {
  const respond = (status: number, error: string, message: string) => {
    const body: ErrorResponse = { error, message };
    return c.json(body, status as any);
  };

  if (err instanceof InvalidCategoryError) {
    return respond(400, 'InvalidCategoryError', err.message);
  }
  if (err instanceof InvalidTierError) {
    return respond(400, 'InvalidTierError', err.message);
  }
  if (err instanceof EmptyAddressListError) {
    return respond(400, 'EmptyAddressListError', err.message);
  }
  if (err instanceof InvalidAddressError) {
    return respond(400, 'InvalidAddressError', err.message);
  }
  if (err instanceof EmptyRecipientsError) {
    return respond(400, 'EmptyRecipientsError', err.message);
  }
  if (err instanceof VaultNotFoundError) {
    return respond(404, 'VaultNotFoundError', err.message);
  }

  // Unrecognized error — log for observability, return generic 500
  console.error('Unhandled error:', err);
  return respond(500, 'InternalError', 'An unexpected error occurred');
}