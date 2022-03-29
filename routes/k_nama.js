var express = require('express');
var router = express.Router();

const kNamaController = require('../controller/k_nama');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/subDetails', async function (req, res, next) {
  const result = await kNamaController.getSubscriberDetail(req.query);
  res.send(result);
});

router.get('/subscribe', async function (req, res, next) {
  const result = await kNamaController.subscribeUser(req.query);
  res.send(result);
});


router.get('/unSubscribe', async function (req, res, next) {
  const result = await kNamaController.unsubscribeUser(req.query);
  res.send(result);
});

module.exports = router;
