# Json2Api
Simple REST API design and implementation, all in one JSON file, for [Node](https://nodejs.org/en/)

## How it work?  
E.g. We wanna have a set of REST APIs:
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
