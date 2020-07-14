const Ajv = require('ajv');

const ValidationError = require('./ValidationError');
const ModuleGetter = require('./ModuleGetter');

const ajv = new Ajv({ allErrors: true });

function validate(schema, object, dir) {
  if (schema) {
    const valid = ajv.validate(ModuleGetter.getModule(schema, dir), object);

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
