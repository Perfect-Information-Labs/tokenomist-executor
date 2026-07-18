// Base class so error-handler.ts can catch all of these with one instanceof check if needed
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ── Input validation errors (400) ────────────────────────────
export class InvalidCategoryError extends ApiError {}
export class InvalidTierError extends ApiError {}
export class EmptyAddressListError extends ApiError {}
export class InvalidAddressError extends ApiError {}
export class EmptyRecipientsError extends ApiError {}

// ── On-chain / lookup errors ─────────────────────────────────
export class VaultNotFoundError extends ApiError {}