/**
 * Home Page.
 */


'use strict';


var express = require('express');
var router = express.Router();
var co = require('../public/javascripts/constants');



router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'NowonLib',
    co: co
  });
});

module.exports = router;
