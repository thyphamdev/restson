const express = require('express');

const ServerConfig = require('./ServerConfig');
const Restson = require('./Restson');

function useApi(router, apiSchema) {
  new Restson(router, apiSchema).convert();
}

class Server {
  constructor({ port = 3000, apiSchema, rootUrl = '/' }) {
    this.port = port;
    this.apiSchema = apiSchema;
    this.rootUrl = rootUrl;
    this.router = express.Router();
  }

  async start() {
    useApi(this.router, this.apiSchema);
    ServerConfig.app.use(this.rootUrl, this.router);
    await ServerConfig.start(this.port);
  }
}

module.exports = Server;
