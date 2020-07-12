const _ = require('lodash');
const express = require('express');

const validateRequest = require('./RequestValidator');
const ControllerWrapper = require('./ControllerWrapper');

function getMiddlewares(mainValidation, routeConfig) {
  let middlewares = [];

  if (mainValidation || routeConfig.validation) {
    middlewares.push(validateRequest(_.assign(mainValidation, routeConfig.validation)));
  }

  if (Array.isArray(routeConfig.middlewares)) {
    middlewares = _.concat(middlewares, routeConfig.middlewares);
  }

  return middlewares;
}

function getController(routerConfig) {
  if (typeof routerConfig === 'function') {
    return routerConfig;
  }

  return routerConfig.controller;
}

function addApiMethod(router, method, path, routeHandler, mainValidation) {
  if (!routeHandler || !routeHandler.controller) {
    return;
  }

  const middlewares = getMiddlewares(mainValidation, routeHandler);
  const controller = getController(routeHandler);

  if (middlewares.length > 0) {
    router[method](path, ...middlewares, ControllerWrapper(controller));
    return;
  }

  router[method](path, ControllerWrapper(controller));
}

class Json2Api {
  constructor(mainRouter, apiSchema) {
    this.mainRouter = mainRouter;
    this.apiSchema = apiSchema;
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
    addApiMethod(router, 'get', path, routeConfig.get, routeConfig.validation);
    addApiMethod(router, 'post', path, routeConfig.post, routeConfig.validation);
    addApiMethod(router, 'put', path, routeConfig.put, routeConfig.validation);
    addApiMethod(router, 'delete', path, routeConfig.delete, routeConfig.validation);
  }

  convert() {
    _.keys(this.apiSchema).forEach((key) => {
      if (key[0] === '/') {
        this.parseRoute(this.mainRouter, key, this.apiSchema[key]);
      }
    });
  }
}

module.exports = Json2Api;
