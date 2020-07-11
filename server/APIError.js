class APIError extends Error {
  constructor(message, serverCode = 500) {
    super(message);
    this.name = 'APIError';
    this.serverCode = serverCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = APIError;
