/**
 * 예약 확인 서비스.
 */


'use strict';


var express = require('express');
var router = express.Router();

var co = require('../public/javascripts/constants');
var nowonlib = require('../nowonlib');
var checkReserve = nowonlib.checkReserve;
var getUserById = nowonlib.getUserById;



// req: Userid=aaaa
// res: {
//     error: 'error',
//     data: {
//         seat[1][rsrv_seq]: '545682', // 일련번호?
//         seat[1][seat_id]: '69',      // 좌석 아이디.
//         seat[1][hsvar]: '1820',      // 예약 시작 시간.
//         seat[1][hevar]: '2000',      // 예약 끝 시간.
//         seat[1][dayact]: '20150825', // 날짜.
//         seat[1][type]: 'NO',
//         chk[]: '1'
//     }
// }
router.post('/', function(req, res, next) {
  var user = getUserById(req.body.Userid);

  if(!user) {
    var errMsg = co.error('checkReserve', 'query가 올바르지 않다.');
    res.json({
      error: errMsg
    });
    return;
  }

  checkReserve(user, function(err, data) {
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
