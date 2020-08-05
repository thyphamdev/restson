module.exports = (req, res) => {
  res.send(`${req.greeting} ${req.name || ''}`);
};
