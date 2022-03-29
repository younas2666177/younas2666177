var express = require('express');
var router = express.Router();

const kAnganController = require('../controller/k_angan');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/getSubscriberDetail', async function (req, res, next) {
  const result = await kAnganController.getSubscriberDetail(req.query);
  res.send(result);
});

router.get('/subscribe', async function (req, res, next) {
  const result = await kAnganController.subscribeUser(req.query);
  res.send(result);
});


router.get('/unSubscribe', async function (req, res, next) {
  if (req.query.unsubMode) {
    req.query.unSubMode = req.query.unsubMode;
  }
  const result = await kAnganController.unsubscribeUser(req.query);
  res.send(result);
});

router.put('/updateSubscriber', async function (req, res, next) {
  req.body.cellno = req.query.cellno;
  const result = await kAnganController.updateSubscriber(req.body);
  res.send(result);
});

module.exports = router;
