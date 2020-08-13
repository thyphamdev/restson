# Restson
Simple REST API design and implementation, all in one JSON file, for [Node](https://nodejs.org/en/)

# Table of Contents
1. [Motivation](#motivation)
2. [Installation](#installation)
3. [Quick start](#quick-start)
    1. [Sample project](#sample-project)
4. [Writing endpoint handlers, middlewares](#writing-endpoint-handlers-middlewares)
5. [API Json Schema](#api-json-schema)
    1. [Keys](#keys)
    2. [File path](#file-path)
6. [API](#api)
    1. [Server](#server)
        1. [options](#options)
    2. [APIError](#apierror)
        1. [APIError Constructor parameters](#apierror-constructor-parameters)
    3. [ServerCodes](#servercodes)

## Motivation <a name="motivation"></a>
After 3 years working with Node + Express to build Backend applications, I have faced a couple of problems
related to REST APIs implementation:
* Endpoints are declared in different files, which is very hard to track them and have an overview.
* Some Devs have a habit to declare all endpoint handlers in one Js file.
Which again make it hard to track when the amount of Endpoints increases.
* Verbose code: 
  * Always have to declare a router (express.Router()) when using a middleware, then use the
    router to use another sub route, then use the main router to use the sub router, ....  
  * Always have to write export / require | import when using the Endpoint handlers, middlewares, ...
* Ugly default error handler, if we wanna implement a beautiful error handler, all the Endpoint handler functions
have to be in the try / catch block, and call next(err) at the end to pass the error to Error Handler middleware.

With all the reasons above, I decided to write this small library, with a hope to help my beloved fellow devs
have an easier way to Design and implement the REST APIs for the Backend apps. The general principal is,
we focus on writing the Endpoint handlers, middlewares, request validation schema only, each in one file.
All the APIs can be written in one JSON file, no need to declare routers. This way enforce a cleaner 
architecture and all devs can have a much clearer overview on the whole API set.

## Installation <a name="installation"></a>
````
> npm install restson
````

## Quick start  <a name="quick-start"></a>
### Sample project <a name="sample-project"></a>
We wanna have a set of REST APIs:
````
GET  /api/v1/health-check
GET  /api/v1/orders/
POST /api/v1/orders/
GET  /api/v1/articles/
GET  /api/v1/articles/:id
````
Directory structure
```
├── controllers
│   ├── healthCheck.js
│   ├── orders
│   │   ├── getOrders.js
│   │   ├── createOrder.js
│   ├── articles
│   │   ├── getArticles.js
│   │   ├── getArticleById.js
│   │   ├── getArticleById.params.validation.json // Written in JSON Schema - https://json-schema.org/
│   ├── middlewares
│   │   ├── printDate.js
├── my.api.schema.json
├── server.js
```  

In file `healthCheck.js`
````javascript
module.exports = (req, res) => res.send('Ok!');
````

In file `my.api.schema.v1.json`
```json
{
  "dir": "controllers",
  "/health-check": {
    "get": "healthCheck"
  },
  "/orders": {
    "dir": "orders",
    "get": "getOrders",
    "post": "createOrder"
  },
  "/articles": {
    "dir": "articles",
    "get": "getArticles",
    "/:id": {
      "get": "getArticleById",
      "validation": {
        "params": "getArticleById.params.validation"
      }
    }
  },
  "middlewares": [
    "middlewares/printDate"
  ]
}
```

In file `server.js`
```javascript
const { Server } = require('restson');
const apiSchema = require('./my.api.schema.v1');

new Server({ apiSchema, rootUrl: '/api/v1' }).start();
```

## Writing endpoint handlers, middlewares <a name="writing-endpoint-handlers-middlewares"></a>
This lib enforces writing each endpoint handler in one js file only, the handler function must be exported at
the end. The same rule applies to middlewares as well.
```javascript
module.exports = (req, res) => res.send('Hello from an endpoint handler!');
```

````javascript
module.exports = (req, res, next) => {
  console.log('Hello from a middleware!!!');
  console.log(new Date().toISOString());
  next();
}
````

## API Json Schema <a name="api-json-schema"></a>

### Keys <a name="keys"></a>
The API Json Schema includes 5 different key types:
* `dir: string`: The main directory where the Endpoint handlers, middlewares and validation schemas are placed
* `middlewares: array<string>`: A list of middlewares' file paths, each middleware is declared in one file.
The order of the list will be the executed order of the middlewares.
* `validation: object`: Declare the validation schemas of the endpoint. The validation schema is defined using 
[Json schema](https://json-schema.org/)
  * `headers`: Validation schema's file path for the request's headers 
  * `body`: Validation schema's file path for the request's body 
  * `params`: Validation schema's file path for the request's parameters 
  * `query`: Validation schema's file path for the request's query
* `get, post, put, delete: string | object`: define the method of the Endpoint. The value can be a string (file
path of the endpoint handler) or an object:
  * `handler: string`: file path of the endpoint handler
  * `validation: object`: Same format as the `validation` key above. This is the validation of this specific
  endpoint and method
  * `middlewares`:  Same format as the `middlewares` key above. This is the middlewares of this specific
  endpoint and method
* Key which start with `/`. (E.g. `/orders`): This key define the Endpoint of the url. The value of it
can have the same keys as defined above or also the sub routes.

### File path <a name="file-path"></a>
the file path to the endpoint handler can be the relative path (depend on `dir` value):
```json
{
  "dir": "controllers",
  "/orders": {
    "dir": "orders",
    "get": {
      "hander": "getOrders" // The handler is placed at ./controllers/orders/getOrders.js
    }
  },
  "middlewares": [
    "middlewares/printDate" // Middleware is located at ./controllers/middlewares/printDate.js
  ]
}
```

or absolute path (independent on `dir` value), in this case, the value must start with `./`
````json
{
  "dir": "controllers",
  "/orders": {
    "dir": "orders",
    "get": {
      "handler": "getOrders"
    },
    "middlewares": [
      "./middlewares/checkOrder" // Middleware is located at ./middlewares/checkOrder.js
    ]
  }
}
````

## API <a name="api"></a>
### Server <a name="server"></a>
`Server` is the main component in `restson`:
````javascript
const restson = require('restson');
const server = new restson.Server(options);
server.start();
````
#### options <a name="options"></a>
| Property  | Description                                  | Type    | Default          |
| ----------| -------------------------------------------- | ------- | ---------------- |
| port      | server will start at this port               | Number  | 3000             |
| apiSchema | [Required] File path of the API JSON Schema  | String  | No default value |
| rootUrl   | Root URL of the API Set                      | String  | /                |

### APIError <a name="apierror"></a>
This is a predefined custom Error in Restson:
````javascript
const { APIError, ServerCodes } = require('restson');

const getOrderController = (req, res) => {
  const order = OrderDAL.findById(req.params.orderId);

  if (order === null) {
    throw new APIError('Order not found!', ServerCodes.NOT_FOUND);
  }

  res.send(order);
};

module.export = getOrderController;
````
#### APIError Constructor parameters <a name="apierror-constructor-parameters"></a>
````javascript
throw new APIError(message, serverCode);
````
| Parameter   | Description                    | Type     | Default           |
| ----------- | -------------------------------|--------- | ----------------- |
| message     | Message to API Consumer Client | String   | no default value  |
| serverCode  | Server Code of the response    | Number   | 500               |

### ServerCodes <a name="servercodes"></a>
This is a small util in Restson, it defines all server codes with 
easy-to-remember constant values:
````javascript
module.exports = {
  CONTINUE: 100,
  SWITCHING_PROTOCOL: 101,
  PROCESSING: 102,
  EARLY_HINT: 103,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFO: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,
  MULTIPLE_CHOICE: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  UNUSED: 306,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOW: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};
````
