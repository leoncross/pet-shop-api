import { BaseError, InternalServerError } from './errors'

export function errorHandler(error: unknown) {
  if (error instanceof BaseError) {
    console.error(error)
    return error.toResponse()
  } else {
    console.error('Unhandled Error:', error)
    return new InternalServerError().toResponse()
  }
}
