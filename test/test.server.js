const { Server } = require('../index');
const apiSchema = require('./test.api.schema');

new Server({ apiSchema, rootUrl: '/api/v1', port: '8081' }).start();
