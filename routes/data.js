/**
 * 좌석 정보 가져오기 서비스.
 */


'use strict';


var express = require('express');
var router = express.Router();

var co = require('../public/javascripts/constants');
var nowonlib = require('../nowonlib');
var seatData = nowonlib.seatData;


/**
 * 좌석 정보 가져오기.
 * @param  {[type]} params 가져올 좌석 아이디들. [69, 70, 81, 92, ...]
 * @param  {[type]} res   {
 *                        error: 'error',
 *                        data: seatId1: [tick1, tick2, tick3, ...],
 *                              seatId2: [tick1, tick2, tick3, ...], ...
 *                        }
 */
router.get('/:seatIds', function(req, res, next) {
  co.log('/data.get', req.params.seatIds);
  var seatIds = JSON.parse(req.params.seatIds);

  seatData(seatIds, function(err, data) {
    if(err) {
      res.json({
        error: err
      });
      return;
    }
    res.json({
      data: data
    });
  });
});


module.exports = router;
