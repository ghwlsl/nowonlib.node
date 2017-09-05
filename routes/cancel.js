/**
 * 예약 취소 서비스.
 */


'use strict';


var express = require('express');
var router = express.Router();
var co = require('../public/javascripts/constants');
var nowonlib = require('../nowonlib');
var cancel = nowonlib.cancel;
var getUserById = nowonlib.getUserById;


// req: Userid=aaaa
// res: {error: error, data: msg}
router.post('/', function(req, res, next) {
  var user = getUserById(req.body.Userid);

  if(!user) {
    var errMsg = co.error('cancel.post', 'query가 올바르지 않다.');
    res.json({
      error: errMsg
    });
    return;
  }

  cancel(user, function(err, msg) {
    res.json({
      error: err,
      data: msg
    });
  });
});


module.exports = router;