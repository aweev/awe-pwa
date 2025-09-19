// lib/api-errors.ts

// This interface matches the error structure of our API routes
export interface ApiErrorPayload {
  error: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    // Pass the main error message to the base Error class
    super(payload.error || 'An API error occurred');
    
    // Set the name of the error, for identification
    this.name = 'ApiClientError';
    
    // Store the additional information
    this.status = status;
    this.payload = payload;
  }
}