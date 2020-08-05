module.exports = (req, res, next) => {
  req.name = 'new name changed';
  next();
};
