const _ = require('lodash');
const express = require('express');

class Json2Api {
  constructor(mainRouter, apiSchema) {
    this.mainRouter = mainRouter;
    this.apiSchema = apiSchema;
  }

  addApiMethod(router, method, path, routeHandler) {
    if (!routeHandler) {
      return;
    }

    if (typeof routeHandler === 'function') {
      router[method](path, routeHandler);
      return;
    }

    router[method](path, routeHandler.controller);
  }

  addSubRoutes(router, path, routeConfig) {
    const subRoute = express.Router();
    let isSubRouteAvailable = false;

    _.keys(routeConfig).forEach((key) => {
      if (key[0] === '/') {
        isSubRouteAvailable = true;
        this.parseRoute(subRoute, key, routeConfig[key]);
      }
    });

    if (isSubRouteAvailable) {
      router.use(path, subRoute);
    }
  }

  parseRoute(router, path, routeConfig) {
    this.addSubRoutes(router, path, routeConfig);
    this.addApiMethod(router, 'get', path, routeConfig.get);
    this.addApiMethod(router, 'post', path, routeConfig.post);
    this.addApiMethod(router, 'put', path, routeConfig.put);
    this.addApiMethod(router, 'delete', path, routeConfig.delete);
  }

  convert() {
    _.keys(this.apiSchema).forEach((key) => {
      this.parseRoute(this.mainRouter, key, this.apiSchema[key]);
    });
  }
}

module.exports = Json2Api;
