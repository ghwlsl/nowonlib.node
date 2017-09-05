'use strict';


var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');



router.get('/array/:array', function(req, res, next) {
  var array = JSON.parse(req.params.array);
  console.log(array);

  res.json({});
});


router.post('/array', function(req, res, next) {
  console.log(req.body);

  res.json({});
});


module.exports = router;
