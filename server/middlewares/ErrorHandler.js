const { Logger } = require('../../logger');
const ServerCodes = require('../ServerCodes');

// eslint-disable-next-line no-unused-vars
module.exports = (error, req, res, next) => {
  switch (error.name) {
    case 'APIError':
      Logger.error(error.message);
      res.status(error.serverCode).send({
        success: false,
        message: error.message,
      });
      return;
    case 'ValidationError':
      Logger.error(error.message, error.errors);
      res.status(error.serverCode).send({
        success: false,
        message: error.message,
      });
      return;
    default:
      Logger.error(error.message);
      res.status(ServerCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: 'Something went wrong with our server!',
      });
  }
};
