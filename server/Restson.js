const _ = require('lodash');
const express = require('express');

const validateRequest = require('./RequestValidator');
const ControllerWrapper = require('./ControllerWrapper');
const ModuleGetter = require('./ModuleGetter');

function getMiddlewares(routeConfig, dir) {
  const middlewares = [];
  const routeValidation = _.get(routeConfig, 'validation');
  const routeMiddlewares = _.get(routeConfig, 'middlewares');

  if (routeValidation) {
    middlewares.push(validateRequest(routeValidation, dir));
  }

  if (Array.isArray(routeMiddlewares)) {
    routeMiddlewares.forEach((mdlw) => {
      middlewares.push(ControllerWrapper(ModuleGetter.getModule(mdlw, dir)));
    });
  }

  return middlewares;
}

function getController(routerConfig, dir) {
  const routerHandler = _.get(routerConfig, 'handler') || routerConfig;
  return ModuleGetter.getModule(routerHandler, dir);
}

function addApiMethod(router, method, path, routeHandler, dir) {
  const middlewares = getMiddlewares(routeHandler, dir);
  const controller = getController(routeHandler, dir);

  if (!controller) {
    return;
  }

  if (middlewares.length > 0) {
    router[method](path, ...middlewares, ControllerWrapper(controller));
    return;
  }

  router[method](path, ControllerWrapper(controller));
}

class Restson {
  constructor(mainRouter, apiSchema) {
    this.mainRouter = mainRouter;
    this.apiSchema = apiSchema;
  }

  addSubRoutes(router, path, routeConfig, dir) {
    const subRoute = express.Router();
    let isSubRouteAvailable = false;

    _.keys(routeConfig).forEach((key) => {
      if (key[0] === '/') {
        isSubRouteAvailable = true;
        this.parseRoute(subRoute, key, routeConfig[key], dir);
      }
    });

    if (isSubRouteAvailable) {
      router.use(path, subRoute);
    }
  }

  parseRoute(router, path, routeConfig, dir) {
    const subDir = ModuleGetter.getFullDir(routeConfig.dir, dir) || dir;
    const middlewares = getMiddlewares(routeConfig, subDir);

    if (middlewares.length > 0) {
      router.use(path, ...middlewares);
    }

    this.addSubRoutes(router, path, routeConfig, subDir);
    addApiMethod(router, 'get', path, routeConfig.get, subDir);
    addApiMethod(router, 'post', path, routeConfig.post, subDir);
    addApiMethod(router, 'put', path, routeConfig.put, subDir);
    addApiMethod(router, 'delete', path, routeConfig.delete, subDir);
  }

  convert() {
    this.parseRoute(this.mainRouter, '/', this.apiSchema);
  }
}

module.exports = Restson;
