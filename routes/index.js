const express = require('express');
const router = express.Router();

router.use('/gpx', require('./gpx'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Gpx Server' });
});

module.exports = router;
