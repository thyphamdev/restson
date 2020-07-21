# Json2Api
Simple REST API design and implementation, all in one JSON file, for [Node](https://nodejs.org/en/)

## Motivation
After 3 years working with Node + Express to build Backend applications, I have faced a couple of problems
related to REST APIs implementation:
* Endpoints are declared in different files, which is very hard to track them or/and have an overview
* Some Devs have a habit to declare all the endpoint handlers (or controllers) functions in one Js file.
Which again make it hard to track when the amount of Endpoints increases.
* Verbose code: 
  * Always have to declare a router (express.Router()) when using a middleware, then use the
    router to use another sub route, then use the main router to use the sub router, ....  
  * Always have to write export / require | import when using the Endpoint handlers, middlewares, ...
* Ugly default error handler: If we wanna implement a beautiful error handler, all the Endpoint handler functions
have to be in the try / catch block, and call next(err) at the end to pass the error to Error Handler middleware.

With all the reasons above, I decided to write this small library, with a hope to help my beloved fellow devs
have an easier way to Design and implement the REST APIs for the Backend apps. The general principal is,
we focus on writing the Endpoint handlers, middlewares, request validation schema only, each in one file.
All the APIs can be written in one JSON file, no need to declare routers. This way enforce a cleaner 
architecture and all devs can have a much clearer overview on the whole API set.

## Quick start  
### Sample project
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
const { Server } = require('json2api');
const apiSchema = require('./my.api.schema.v1');

new Server({ apiSchema, rootUrl: '/api/v1' }).start();
```

## Writing endpoint handlers, middlewares
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

## API Json Schema

### Keys
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
  * `controller: string`: file path of the endpoint handler
  * `validation: object`: Same format as the `validation` key above. This is the validation of this specific
  endpoint and method
  * `middlewares`:  Same format as the `middlewares` key above. This is the middlewares of this specific
  endpoint and method
* Key which start with `/`. (E.g. `/orders`): This key define the Endpoint of the url. The value of it
can have the same keys as defined above or also the sub routes.

### File path
the file path to the endpoint handler can be the relative path (depend on `dir` value):
```json
{
  "dir": "controllers",
  "/orders": {
    "dir": "orders",
    "get": {
      "controller": "getOrders" // The handler is placed at ./controllers/orders/getOrders.js
    }
  },
  "middlewares": [
    "middlewares/printDate" // Middleware is located at ./controllers/middlewares/printDate.js
  ]
}
```

or absolute path (independent with `dir` value), in this case, the value must start with `./`
````json
{
  "dir": "controllers",
  "/orders": {
    "dir": "orders",
    "get": {
      "controller": "getOrders"
    },
    "middlewares": [
      "./middlewares/checkOrder" // Middleware is located at ./middlewares/checkOrder.js
    ]
  }
}
````
