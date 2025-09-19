// lib/auth/auth.errors.ts

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid credentials provided.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountExistsError extends AuthError {
  constructor(message = 'An account with this email already exists.') {
    super(message);
    this.name = 'AccountExistsError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message = 'The provided token is invalid or has expired.') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class MfaRequiredError extends AuthError {
  // We include a temporary token to ensure the user passed the first step
  public mfaToken: string;

  constructor(mfaToken: string, message = 'Multi-factor authentication is required.') {
    super(message);
    this.name = 'MfaRequiredError';
    this.mfaToken = mfaToken;
  }
}