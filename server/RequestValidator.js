const Ajv = require('ajv');

const ValidationError = require('./ValidationError');

const ajv = new Ajv({ allErrors: true });

function validate(schema, object) {
  if (schema) {
    const valid = ajv.validate(schema, object);

    if (!valid) {
      throw new ValidationError(ajv.errorsText(), ajv.errors);
    }
  }
}

module.exports = (validationSchema) => (req, res, next) => {
  try {
    validate(validationSchema.params, req.params);
    validate(validationSchema.query, req.query);
    validate(validationSchema.body, req.body);
    next();
  } catch (e) {
    next(e);
  }
};
