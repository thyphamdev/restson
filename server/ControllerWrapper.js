module.exports = (controller) => (req, res, next) => {
  try {
    controller(req, res, next);
  } catch (e) {
    next(e);
  }
};
