const APIError = require('./APIError');
const ServerCodes = require('./ServerCodes');

class ValidationError extends APIError {
  constructor(message, errors) {
    super(message, ServerCodes.BAD_REQUEST);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError;
