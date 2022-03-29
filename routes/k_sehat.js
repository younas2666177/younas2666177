var express = require('express');
var router = express.Router();

const kSehatController = require('../controller/k_sehat');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/subDetails', async function (req, res, next) {
  const result = await kSehatController.getSubscriberDetail(req.query);
  res.send(result);
});

router.get('/subscribe', async function (req, res, next) {
  const result = await kSehatController.subscribeUser(req.query);
  res.send(result);
});


router.get('/unSubscribe', async function (req, res, next) {
  const result = await kSehatController.unsubscribeUser(req.query);
  res.send(result);
});

router.put('/updateSubscriber', async function (req, res, next) {
  req.body.cellno = req.query.cellno;
  const result = await kSehatController.updateSubscriber(req.body);
  res.send(result);
});

module.exports = router;
