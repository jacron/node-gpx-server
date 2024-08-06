const express = require('express');
// const {join} = require("path");
const router = express.Router();

router.use('/gpx', require('./gpx'));

/* GET home page. */
router.get('/home', (req, res) => {
  res.render('index', { title: 'Gpx Server' });
});

// Voor elke andere route, retourneer de index.html vanuit de Angular distributie directory.
// NB Dat gaat vanzelf zo.
// router.get('*', (req, res) => {
//   res.sendFile(join(__dirname, 'dist/my-angular-app/index.html'));
// });

module.exports = router;
