const ServerConfig = require('./ServerConfig');
const APIError = require('./APIError');
const Json2Api = require('./Json2Api');
const ServerCodes = require('./ServerCodes');

class Server {
  constructor() {
    this.APIError = APIError;
    this.ServerCodes = ServerCodes;
  }

  useApi(jsonApi) {
    new Json2Api(ServerConfig.app, jsonApi).convert();
  }

  async start() {
    await ServerConfig.start();
  }
}

module.exports = new Server();
