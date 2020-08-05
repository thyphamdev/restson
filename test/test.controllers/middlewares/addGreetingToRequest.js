module.exports = (req, res, next) => {
  req.greeting = 'Hello';
  next();
};
