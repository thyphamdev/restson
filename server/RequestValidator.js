const Ajv = require('ajv');

const ValidationError = require('./ValidationError');

const ajv = new Ajv({ allErrors: true });

function validate(schema, object, dir) {
  let validationSchema;

  if (typeof schema === 'string') {
    if (schema.startsWith('./')) {
      validationSchema = require.main.require(schema);
    } else if (dir) {
      validationSchema = require.main.require(`./${dir}/${schema}`);
    } else {
      validationSchema = require.main.require(`./${schema}`);
    }
  }

  if (typeof schema === 'object') {
    validationSchema = schema;
  }

  if (validationSchema) {
    const valid = ajv.validate(validationSchema, object);

    if (!valid) {
      throw new ValidationError(ajv.errorsText(), ajv.errors);
    }
  }
}

module.exports = (validationSchema, dir) => (req, res, next) => {
  try {
    validate(validationSchema.params, req.params, dir);
    validate(validationSchema.query, req.query, dir);
    validate(validationSchema.body, req.body, dir);
    validate(validationSchema.headers, req.headers, dir);
    next();
  } catch (e) {
    next(e);
  }
};
