module.exports = (req, res) => {
  res.send({
    message: 'Hello from createOrder',
    data: req.body,
  });
};
