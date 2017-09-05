/**
 * 좌석 예약 서비스.
 */


'use strict';


var express = require('express');
var router = express.Router();
var co = require('../public/javascripts/constants');
var reserve = require('../nowonlib').reserve;


// req: seat_id=69&Hsvar=19&Hevar=28
// 좌석 아이디 & 예약 시작 tick & 예약 끝 tick.
// res: {error: error, data: msg}
router.post('/', function(req, res, next) {
  if(!req.body.seat_id || !req.body.Hsvar || !req.body.Hevar) {
    res.json({
      error: co.error('reserve', 'query가 올바르지 않다.')
    });
    return;
  }

  reserve(req.body, function(err, msg) {
    res.json({
      error: err,
      data: msg
    });
  });
});


module.exports = router;
