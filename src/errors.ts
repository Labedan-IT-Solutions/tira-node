export class TiraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TiraError';
  }
}

export class TiraApiError extends TiraError {
  public readonly status: number;
  public readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`Tira API error: ${status} ${statusText}`);
    this.name = 'TiraApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export class TiraValidationError extends TiraError {
  public readonly field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'TiraValidationError';
    this.field = field;
  }
}

export class TiraSignatureError extends TiraError {
  constructor(message: string = 'Callback signature verification failed') {
    super(message);
    this.name = 'TiraSignatureError';
  }
}
