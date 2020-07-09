const _ = require('lodash');
const express = require('express');

const validateRequest = require('./RequestValidator');
const ControllerWrapper = require('./ControllerWrapper');

class Json2Api {
  constructor(mainRouter, apiSchema) {
    this.mainRouter = mainRouter;
    this.apiSchema = apiSchema;
  }

  // eslint-disable-next-line class-methods-use-this
  addApiMethod(router, method, path, routeHandler) {
    if (!routeHandler) {
      return;
    }

    if (typeof routeHandler === 'function') {
      router[method](path, ControllerWrapper(routeHandler));
      return;
    }

    const middlewares = [];

    if (routeHandler.validation) {
      middlewares.push(validateRequest(routeHandler.validation));
    }

    if (Array.isArray(routeHandler.middlewares)) {
      routeHandler.middlewares.forEach((mldw) => middlewares.push(ControllerWrapper(mldw)));
    }

    if (middlewares.length > 0) {
      router[method](path, ...middlewares, ControllerWrapper(routeHandler.controller));
      return;
    }

    router[method](path, ControllerWrapper(routeHandler.controller));
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
    if (Array.isArray(routeConfig.middlewares) && routeConfig.middlewares.length > 0) {
      router.use(path, ...routeConfig.middlewares);
    }

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
