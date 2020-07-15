const Ajv = require('ajv');

const ValidationError = require('./ValidationError');
const ModuleGetter = require('./ModuleGetter');

const ajv = new Ajv({ allErrors: true });

function validate(type, schema, object, dir) {
  if (schema) {
    const valid = ajv.validate(ModuleGetter.getModule(schema, dir), object);

    if (!valid) {
      throw new ValidationError(`Invalid request's ${type}: ${ajv.errorsText()}`, ajv.errors);
    }
  }
}

module.exports = (validationSchema, dir) => (req, res, next) => {
  try {
    validate('params', validationSchema.params, req.params, dir);
    validate('query', validationSchema.query, req.query, dir);
    validate('body', validationSchema.body, req.body, dir);
    validate('headers', validationSchema.headers, req.headers, dir);
    next();
  } catch (e) {
    next(e);
  }
};
