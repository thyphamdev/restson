module.exports = (req, res, next) => {
  req.name = 'Name Middleware';
  next();
};
