var express = require('express');
var router = express.Router();

const kTahaffuzController = require('../controller/k_tahaffuz');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/subDetails', async function (req, res, next) {
  const result = await kTahaffuzController.getSubscriberDetail(req.query);
  res.send(result);
});

router.get('/subscribe', async function (req, res, next) {
  const result = await kTahaffuzController.subscribeUser(req.query);
  res.send(result);
});

router.put('/updateSubscriber', async function (req, res, next) {
  req.body.cellno = req.query.cellno;
  const result = await kTahaffuzController.updateSubscriber(req.body);
  res.send(result);
});

router.get('/unSubscribe', async function (req, res, next) {
  const result = await kTahaffuzController.unsubscribeUser(req.query);
  res.send(result);
});

module.exports = router;
