var express = require('express');
var router = express.Router();

const kZamindarController = require('../controller/k_zamindar');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/getSubscriberDetail', async function (req, res, next) {
  const result = await kZamindarController.getSubscriberDetail(req.query);
  res.send(result);
});

router.get('/subscribe', async function (req, res, next) {
  const result = await kZamindarController.subscribeUser(req.query);
  res.send(result);
});


router.get('/unSubscribe', async function (req, res, next) {
  const result = await kZamindarController.unsubscribeUser(req.query);
console.log(result);
  res.send(result);
});

router.get('/sendSms', async function (req, res, next) {
  const result = await kZamindarController.sendSms(req.query);
  res.send(result);
});


router.get('/update/profile', async function (req, res, next) {

  console.log('Check', req.query);
  
  const result = await kZamindarController.updateUserProfile(req.query);
  res.send(result);
});

module.exports = router;
