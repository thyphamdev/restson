const ServerConfig = require('./ServerConfig');
const Json2Api = require('./Json2Api');

function useApi(jsonApi) {
  new Json2Api(ServerConfig.app, jsonApi).convert();
}

class Server {
  constructor({ port = 3000, apiSchema }) {
    this.port = port;
    this.apiSchema = apiSchema;
  }

  async start() {
    useApi(this.apiSchema);
    await ServerConfig.start(this.port);
  }
}

module.exports = Server;
