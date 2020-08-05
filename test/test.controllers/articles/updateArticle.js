module.exports = (req, res) => {
  res.send({
    message: 'Hello from updateArticle',
    data: req.body,
  });
};
