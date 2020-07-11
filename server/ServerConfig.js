const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const { Logger } = require('../logger');
const { ErrorHandler } = require('./middlewares');

class ServerConfig {
  constructor() {
    this.app = express();
  }

  useMiddlewares() {
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(helmet());
  }

  useRouters() {
    this.app.get('/health', (req, res) => res.send('ok'));
  }

  start(port) {
    this.useMiddlewares();
    this.useRouters();

    // Must be at last, after all other middlewares
    this.app.use(ErrorHandler);

    return new Promise((resolve) => {
      this.app.listen(port, () => {
        Logger.info(`Server started at port ${port}`);
        resolve(true);
      });
    });
  }
}

module.exports = new ServerConfig();
