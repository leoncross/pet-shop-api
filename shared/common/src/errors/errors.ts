export class BaseError extends Error {
  statusCode: number
  cause?: Error

  constructor(message: string, statusCode: number, cause?: Error) {
    super(message)
    this.statusCode = statusCode
    this.cause = cause
  }
  toResponse() {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify({ message: this.message }),
    }
  }
}

export class BadRequestError extends BaseError {
  constructor(message = 'Bad Request') {
    super(message, 400)
  }
  static forMissingField(field: string) {
    return new this(`Bad Request: Missing required field: ${field}`)
  }
}

export class NotImplemented extends BaseError {
  constructor(message = 'Not Implemented') {
    super(message, 501)
  }
}

export class InternalServerError extends BaseError {
  constructor(message = 'Internal Server Error') {
    super(message, 500)
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message = 'Service Unavailable') {
    super(message, 503)
  }
}
