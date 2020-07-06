module.exports = {
  server: {
    port: process.env.LZ_SERVER_PORT,
  },
  db: {
    mongo: {
      uri: process.env.LZ_DB_MONGO_URI,
    },
  },
};
