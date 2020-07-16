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
have an easier way to Design and implement the REST APIs for the Backend apps.

## How it work?  
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
│   │   ├── getArticleById.params.validation.json
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
