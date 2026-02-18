export class TiraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TiraError";
  }
}

export class TiraApiError extends TiraError {
  public readonly status: number;
  public readonly bodyText: string;

  constructor(status: number, bodyText: string) {
    super(`Tira API error: ${status} ${bodyText}`);
    this.name = "TiraApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

export class TiraValidationError extends TiraError {
  public readonly field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = "TiraValidationError";
    this.field = field;
  }
}

export class TiraSignatureError extends TiraError {
  constructor(message: string = "Callback signature verification failed") {
    super(message);
    this.name = "TiraSignatureError";
  }
}
