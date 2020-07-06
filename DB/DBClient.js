const { MongoClient } = require('mongodb');

const config = require('../config');
const { Logger } = require('../Services');

class DBClient {
  constructor() {
    this.client = new MongoClient(config.db.mongo.uri, { useUnifiedTopology: true });
  }

  async start() {
    await this.client.connect();
    Logger.info('Database connected!');
  }
}

module.exports = new DBClient();
