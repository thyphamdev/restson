const _ = require('lodash');
const express = require('express');

const validateRequest = require('./RequestValidator');
const ControllerWrapper = require('./ControllerWrapper');

function getMiddlewares(mainValidation, routeConfig, dir) {
  const middlewares = [];
  const routeValidation = _.get(routeConfig, 'validation');
  const routeMiddlewares = _.get(routeConfig, 'middlewares');

  if (mainValidation || routeValidation) {
    middlewares.push(validateRequest(_.assign(mainValidation, routeValidation), dir));
  }

  if (routeConfig && Array.isArray(routeMiddlewares)) {
    routeMiddlewares.forEach((mdlw) => {
      if (typeof mdlw === 'string') {
        if (mdlw.startsWith('./')) {
          middlewares.push(ControllerWrapper(require.main.require(mdlw)));
        } else if (dir) {
          middlewares.push(ControllerWrapper(require.main.require(`./${dir}/${mdlw}`)));
        } else {
          middlewares.push(ControllerWrapper(require.main.require(`./${mdlw}`)));
        }
      } else {
        middlewares.push(ControllerWrapper(mdlw));
      }
    });
  }

  return middlewares;
}

function getController(routerConfig, dir) {
  if (!routerConfig) {
    return null;
  }

  if (typeof routerConfig === 'function') {
    return routerConfig;
  }

  if (typeof routerConfig === 'string') {
    if (routerConfig.startsWith('./')) {
      return require.main.require(routerConfig);
    }

    const fullDir = dir ? `./${dir}/${routerConfig}` : `./${routerConfig}`;
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require.main.require(fullDir);
  }

  if (typeof routerConfig.controller === 'function') {
    return routerConfig.controller;
  }

  if (typeof routerConfig.controller === 'string') {
    if (routerConfig.controller.startsWith('./')) {
      return require.main.require(routerConfig.controller);
    }

    const fullDir = dir ? `./${dir}/${routerConfig.controller}` : `./${routerConfig.controller}`;
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require.main.require(fullDir);
  }

  return null;
}

function addApiMethod(router, method, path, routeHandler, mainValidation, dir) {
  const middlewares = getMiddlewares(mainValidation, routeHandler, dir);
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

class Json2Api {
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
    let subDir = routeConfig.dir;

    if (dir && routeConfig.dir && !routeConfig.dir.startsWith('./')) {
      subDir = `${dir}/${routeConfig.dir}`;
    }

    if (dir && !routeConfig.dir) {
      subDir = dir;
    }

    if (Array.isArray(routeConfig.middlewares) && routeConfig.middlewares.length > 0) {
      const middlewares = [];

      routeConfig.middlewares.forEach((mdlw) => {
        if (typeof mdlw === 'string') {
          if (mdlw.startsWith('./')) {
            middlewares.push(ControllerWrapper(require.main.require(mdlw)));
          } else if (dir) {
            middlewares.push(ControllerWrapper(require.main.require(`./${dir}/${mdlw}`)));
          } else {
            middlewares.push(ControllerWrapper(require.main.require(`./${mdlw}`)));
          }
        } else {
          middlewares.push(ControllerWrapper(mdlw));
        }
      });

      router.use(path, ...middlewares);
    }

    this.addSubRoutes(router, path, routeConfig, subDir);
    addApiMethod(router, 'get', path, routeConfig.get, routeConfig.validation, subDir);
    addApiMethod(router, 'post', path, routeConfig.post, routeConfig.validation, subDir);
    addApiMethod(router, 'put', path, routeConfig.put, routeConfig.validation, subDir);
    addApiMethod(router, 'delete', path, routeConfig.delete, routeConfig.validation, subDir);
  }

  convert() {
    const { dir } = this.apiSchema;

    _.keys(this.apiSchema).forEach((key) => {
      if (key[0] === '/') {
        this.parseRoute(this.mainRouter, key, this.apiSchema[key], dir);
      }
    });
  }
}

module.exports = Json2Api;
