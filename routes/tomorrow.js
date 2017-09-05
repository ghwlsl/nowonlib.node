/**
 * 내일 예약 서비스.
 */


'use strict';


var express = require('express');
var router = express.Router();

var Chain = require('../public/javascripts/chain');
var co = require('../public/javascripts/constants');
var db = co.db;
var nowonlib = require('../nowonlib');
var seatData = nowonlib.seatData;
var reserve = nowonlib.reserve;
var checkReserve = nowonlib.checkReserve;
var cancel = nowonlib.cancel;


var Timer = {
  timeId: null
};
Timer.tryCount = 0;

Timer.on = function() {
  Timer.tryCount = 0;
  Timer.off();

  var time = new Date();
  time.setHours(9);
  time.setMinutes(0);
  time.setSeconds(40);
  time.setMilliseconds(0);
  var interval = time - Date.now();
  if(interval < 0) {
    interval += 1000 * 60 * 60 * 24;
  }

  // interval = 10000;
  Timer.timeId = setTimeout(Timer.reserve, interval);
  return interval;
};


Timer.reTry = function(interval) {
  if((Timer.tryCount++) >= 3) {
    co.log('tomorrow', 'Timer.reTry', '예약에 실패했다.');
    return;
  }

  co.log('tomorrow', 'Timer.reTry', '예약 다시 시도 :: ', Timer.tryCount, '번째.');
  Timer.timeId = setTimeout(Timer.reserve, interval);
  return interval;
}


Timer.off = function() {
  clearTimeout(Timer.timeId);
  Timer.timeId = null;
};


Timer.reserve = function() {
  Timer.off();

  co.log('tomorrow', 'Timer.reserve', '자동 예약 시작!!');

  var realRanges = [];
  for(var i = 0; i < db.tomorrowRangeList.length; i++) {
    var ranges = splitTickRange(db.tomorrowRangeList[i]);
    for(var j = 0; j < ranges.length; j++) {
      realRanges.push(ranges[j]);
    }
  }

  co.log('tomorrow', 'Timer.reserve', '시간 범위 조각', realRanges);

  var chain = new Chain();
  var seats = db.showList.getData();
  for(var i = 0; i < seats.length; i++) {
    execAbleSeat(chain, seats[i], realRanges);
  }
  chain.exec(function(seatId) {
    if(seatId !== undefined) {
      co.log('tomorrow', 'Timer.reserve', '예약할 좌석 아이디', seatId);

      var reserveChain = new Chain();
      var reserveCount = [];
      for(var i = 0; i < realRanges.length; i++) {
        execReserve(reserveChain, seatId, realRanges[i]);
      }
      for(var i = 0; i < db.users.length; i++) {
        execCheckReserve(reserveChain, db.users[i], seatId, reserveCount);
      }
      reserveChain.exec(function(err) {
        if(err) {
          co.error('tomorrow', 'Timer.reserve', err);
          Timer.reTry(1000 * 60);
          return;
        }

        if(realRanges.length === reserveCount.length) {
          co.log('tomorrow', 'Timer.reserve', '예약이 정상적으로 이루어 졌다.');
          if(db.from && db.from.id && db.from.pw && db.to) {
            nowonlib.sendMailReserve({
              seatId,
              ranges: realRanges,
            }, function(err, info) {
              if(err) {
                co.error('tomorrow', 'sendMailReserve()', err);
                return;
              }
              co.log('tomorrow', 'sendMailReserve()', '예약 메일 보내기 성공.');
            });
          }
        } else {
          co.log('tomorrow', 'Timer.reserve', '예약이 정상적으로 되지 않은 것 같다.', '예약수', reserveCount.length);
          allCancel(function() {
            Timer.reTry(1000 * 60);
          });
        }
      });
    } else {
      co.log('tomorrow', 'Timer.reserve', '예약할 수 있는 좌석이 없다.');
    }
  });
};


var execAbleSeat = function(chain, seatId, rangeList) {
  chain.push(function(next) {
    seatData([seatId], function(err, data) {
      if(err) {
        next();
        return;
      }

      var sGreen = -1;
      var eGreen = -1;
      var ticks = data[seatId];
      for(var i = 0; i < ticks.length; i++) {
        if(ticks[i] === co.Bar.green) {
          if(sGreen === -1) {
            sGreen = i;
          }
        } else if(sGreen !== -1) {
          eGreen = i - 1;
          break;
        }
      }
      if(eGreen === -1) {
        eGreen = ticks.length - 1;
      }

      if(sGreen === -1) {
        next();
        return;
      }

      var include = true;
      for(var i = 0; i < rangeList.length; i++) {
        include = includeRange([sGreen, eGreen], rangeList[i]);
        if(include === false) {
          break;
        }
      }

      if(include === true) {
        next(seatId);
      } else {
        next();
      }
    });
  });
};


var execReserve = function(chain, seatId, range) {
  chain.push(function(next) {
    reserve({
      seat_id: seatId,
      Hsvar: range[0],
      Hevar: range[1]
    }, function(err, data) {
      if(err) {
        next(err);
        return;
      }

      next();
    });
  });
};


var execCheckReserve = function(chain, user, seatId, count) {
  chain.push(function(next) {
    checkReserve(user, function(err, data) {
      if(err) {
        next(err);
        return;
      }

      if(data['seat[1][seat_id]'] == seatId) {
        count.push(true);
      }
      next();
    });
  });
};


var execCancel = function(chain, user) {
  chain.push(function(next) {
    cancel(user, function(err, msg) {
      next();
    });
  });
};


var allCancel = function(callback) {
  var chain = new Chain();
  for(var i = 0; i < db.users.length; i++) {
    execCancel(chain, db.users[i]);
  }
  chain.exec(callback);
};


var splitTickRange = function(range) {
  var splits = [];
  var start = range[0];
  var end = range[1];

  while(true) {
    var limited = start + co.LIMITED_TICKS - 1;
    if(limited < end) {
      splits.push([start, limited]);
      start = limited + 1;
    } else {
      splits.push([start, end]);
      break;
    }
  }

  return splits;
};


var includeRange = function(whole, part) {
  if(whole[0] <= part[0] && whole[1] >= part[1]) {
    return true;
  }
  return false;
}


function toStringTime(interval) {
  var hours = interval - interval % (1000 * 60 * 60);
  var seconds = interval - interval % (1000 * 60) - hours;
  var milli = interval - interval % 1000 - hours - seconds;
  var time = (hours / (1000 * 60 * 60)).toString()
    + ':' + (seconds / (1000 * 60)).toString()
    + ':' + (milli / 1000).toString();
  return time;
}


/**
 * 내일예약 시간 불러오기.
 * @param  {[type]} req   .
 * @param  {[type]} res   RangeList: [[0, 22], [23, 46], ...]
 */
router.get('/', function(req, res, next) {
  co.log('/tomorrow.get', db.tomorrowRangeList);
  res.json({
    data: db.tomorrowRangeList
  });
});


/**
 * 내일예약 시간 저장.
 * @param  {[type]} req   RangeList: [[0, 22], [23, 46], ...]
 * @param  {[type]} res   {data: msg}
 */
router.put('/', function(req, res, next) {
  db.tomorrowRangeList = req.body;
  co.log('/tomorrow.put', '내일예약 시간 저장', db.tomorrowRangeList);
  var msg;
  if(!db.tomorrowRangeList || db.tomorrowRangeList.length === 0) {
    Timer.off();
    msg = co.log('/tomorrow.put', '내일예약 시간 저장 완료.', '내일예약 Off.');
  } else {
    var interval = Timer.on();
    msg = co.log('/tomorrow.put', '내일예약 시간 저장 완료.'
      , '내일예약 On.', toStringTime(interval) + ' 후 실행.');
  }
  res.json({
    data: msg
  });
});


router.get('/on_off', function(req, res, next) {
  var on_off = (Timer.timeId) ? 'on' : 'off';
  co.log('/tomorrow/on_off.get', on_off);
  res.json({
    data: on_off
  });
});


router.put('/on_off', function(req, res, next) {
  co.log('/tomorrow/on_off.put', req.body.onOff);
  if(req.body.onOff === 'on') {
    if(db.tomorrowRangeList.length !== 0) {
      var interval = Timer.on();
      var msg = co.log('/tomorrow/on_off.put', '내일예약 On.'
        , toStringTime(interval), '후 실행.');
      res.json({
        data: msg
      });
    } else {
      res.json({
        data: co.log('/tomorrow/on_off.put', '시간이 설정되있지 않아 내일예약을 On 할 수 없다.')
      });
    }
  } else if(req.body.onOff === 'off') {
    Timer.off();
    res.json({
      data: co.log('/tomorrow/on_off.put', '내일예약 Off.')
    });
  } else {
    res.json({
      error: co.error('/tomorrow/on_off.put', '잘못된 req.')
    });
  }
});


module.exports = router;
