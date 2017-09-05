/**
 * nowonlib.js
 */


var http = require('http');
var request = require('request');
var querystring = require('querystring');
var jsdom = require('node-jsdom');
var iconv = require('iconv-lite');
var nodemailer = require('nodemailer');
var co = require('./public/javascripts/constants');
var db = co.db;
var Chain = require('./public/javascripts/chain');

var fs = require('fs');
var path = require('path');
var jquery = fs.readFileSync(path.join(
  __dirname, 'public/javascripts/jquery.js'), 'utf-8');



var Tandem = function() {
  this.items = [];
};


Tandem.prototype = {
  push: function(callback) {
    this.items.push(callback);
  },


  exec: function(callback) {
    var count = this.items.length;
    var fun;

    while(fun = this.items.shift()) {
      fun(finished);
    }

    function finished(err) {
      if(err || (--count) === 0) {
        callback(err);
      }
    }
  }
};



var getUserById = function(userId) {
  var user = null;
  for(var i in db.users) {
    if(db.users[i].id === userId) {
      user = db.users[i];
      break;
    }
  }

  return user;
};




var getBarName = function(src) {
  var barName = co.Bar.unknown;

  switch(src) {
    case 'src="./images/range/bar_orange':
      barName = co.Bar.orange;
      break;

    case 'src="./images/range/bar_black':
      barName = co.Bar.black;
      break;

    case 'src="./images/range/bar_gray':
      barName = co.Bar.gray;
      break;

    case 'src="./images/range/bar_green':
      barName = co.Bar.green;
      break;

    default:
      break;
  }

  return barName;
};


var urlOpt = {
  host: 'connect.nowonlib.kr',
  port: '8800'
};
var pathPattern = '/Web_LibMate3/Vorvertrag_Position.php?id=@@@&s=1&t=19&dayAct=0';

/**
 * 좌석 가져오기.
 * @param  {[type]}   seatIds  가져올 좌석 아이디들 [69, 72, 84, ...]
 * @param  {Function} callback function(error, data)
 * data: {
 *     seatId1: [tick1, tick2, tick3, ...],
 *     seatId2: [tick1, tick2, tick3, ...], ...
 * }
 */
var seatData = function(seatIds, callback) {
  var data = {};
  var chain = new Chain();

  var execData = function(id) {
    chain.push(function(next) {
      var body = '';
      urlOpt.path = pathPattern.replace('@@@', id);

      http.get(urlOpt, function(response) {
        response.on('data', function(chunk) {
          body += chunk.toString();
        }).on('end', function() {
          var ticks = [];
          for(var i = 0; i <= (co.LIB_HOURS * co.TICKS_OF); i++) {
            ticks[i] = co.Bar.unknown;
          }

          var pattern = /src=".\/images\/range\/\w+/g;
          var bars = body.match(pattern);
          var tickId = (co.START_TIME - co.BASE_START_TIME) * co.TICKS_OF + 1;
          for(var i = 0; i < bars.length; i++) {
            ticks[tickId++] = getBarName(bars[i]);
          }

          data[id] = ticks;

          next();
        });
      }).on('error', function(e) {
        co.error(e.stack);
        next(e.stack);
      });
    });
  };


  var checkReserveDatas = [];
  var execCheckReserve = function(user) {
    chain.push(function(next) {
      checkReserve(user, function(err, data) {
        if(err) {
          next(err);
          return;
        }

        data.Userid = user.id;
        checkReserveDatas.push(data);
        next();
      });
    });
  };


  for(var i = 0; i < seatIds.length; i++) {
    execData(seatIds[i]);
  }
  for(var i in db.users) {
    execCheckReserve(db.users[i]);
  }


  chain.exec(function(err) {
    if(err) {
      var errMsg = 'seatData: ' + err;
      co.error(errMsg);
      callback(errMsg);
      return;
    }

    for(var i in checkReserveDatas) {
      var crd = checkReserveDatas[i];
      if(crd['seat[1][rsrv_seq]']) {
        var userId = crd['Userid'];
        var seatId = crd['seat[1][seat_id]'];
        var hsvar = crd['seat[1][hsvar]'];
        var hevar = crd['seat[1][hevar]'];
        var sTick = co.toTickByTime(hsvar, true);
        var eTick = co.toTickByTime(hevar, false);

        if(data[seatId]) {
          for(var tick = sTick; tick <= eTick; tick++) {
            if(data[seatId][tick] == co.Bar.orange) {
              data[seatId][tick] = co.tagReservedUser(userId);
            }
          }
        }
      }
    }

    callback(undefined, data);
  });
};



var reserveUrl = 'http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_Sql.php';
var patt = /parent.document.getElementById\('msg'\).innerHTML = /;
/**
 * #### 좌석 예약.
 * - Post :: Content-Type:application/x-www-form-urlencoded
 * - seat_id: 69 // 좌석 아이디.
 * - Hsvar: 19 // 시작 tick
 * - Hevar: 28 // 끝 tick
 * - StimeVar: 0900 // 예약 시작 시간.
 * - EtimeVar: 1040 // 예약 끝 시간.
 * - bars: 5 // 화면 위치 저장. (중요하지 않음.)
 * - dayAct: 0 // ???
 * - Userid: aaaa // 유저 아이디.
 * - Userpw: bbbb // 유저 패스워드.
 * @param  {[type]}   req     {seat_id: '69', Hsvar: '19', Hevar: '28'}
 * @param  {Function} callback function(error, msg)
 */
var reserve = function(req, callback) {
  ableReserveUser(db.users, function(user) {
    if(!user) {
      callback(co.error('reserve', '예약 가능한 아이디가 없다.'));
      return;
    }

    delete user.data;

    var postData = {
      seat_id: req.seat_id,
      Hsvar: req.Hsvar,
      Hevar: req.Hevar,
      StimeVar: co.toTimeByTick(parseInt(req.Hsvar), true, false),
      EtimeVar: co.toTimeByTick(parseInt(req.Hevar), false, false),
      bars: 5,
      dayAct: 0,
      Userid: user.id,
      Userpw: user.pw
    };

    request({
      url: reserveUrl,
      method: 'POST',
      form: postData,
    }, function(error, response, body) {
      if(error) {
        var errMsg = 'reserve: ' + error;
        co.error(errMsg);
        callback(errMsg);
        return;
      }
      if(response.statusCode !== 200) {
        var errMsg = 'reserve: Invalid Status Code Returned: ' + response.statusCode;
        co.error(errMsg);
        callback(errMsg);
        return;
      }
    })
    .on('response', function(response) {
      response.on('data', function(data) {
        var str = iconv.decode(data, 'euc-kr');
        var lines = str.split('\n');
        var msg = '';
        for(var i in lines) {
          if(lines[i].search(patt) !== -1) {
            msg = lines[i].replace(patt, '');
            msg = msg.replace(/^\s*"/, '');
            msg = msg.replace(/";/, '');
            break;
          }
        }
        callback(undefined, co.log('reserve', user.id, msg));
      });
    });
  });
}



var checkReserveUrl = 'http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_List.php';
/**
 * 예약 확인.
 * - Post ::
 * - Userid: aaaa
 * - Userpw: bbbb
 * - x: 0
 * - y: 0
 * @param  {[type]}   user     {id: 'aaaa', pw: 'bbbb'}
 * @param  {Function} callback function(error, {
 *                             seat[1][rsrv_seq]: '545682', // 일련번호?
 *                             seat[1][seat_id]: '69',      // 좌석 아이디.
 *                             seat[1][hsvar]: '1820',      // 예약 시작 시간.
 *                             seat[1][hevar]: '2000',      // 예약 끝 시간.
 *                             seat[1][dayact]: '20150825', // 날짜.
 *                             seat[1][type]: 'NO',
 *                             chk[]: '1'
 *                             })
 */
var checkReserve = function(user, callback) {
  if(user.data) {
    if(user.data['seat[1][rsrv_seq]']) {
      var dayStr = user.data['seat[1][dayact]'];
      var year = dayStr.slice(0, 4);
      var month = dayStr.slice(4, 6) - 1;
      var day = dayStr.slice(6, 8);
      var timeStr = user.data['seat[1][hevar]'];
      var hours = timeStr.slice(0, 2);
      var minutes = timeStr.slice(2, 4);

      var reserveTime = new Date(year, month, day, hours, minutes);
      if((reserveTime - Date.now()) > 0) {
        co.log('재활용: ', user.id, ': 예약 됨.');
        callback(undefined, user.data);
        return;
      }
      delete user.data;
    } else {
      co.log('재활용: ', user.id, ' : 예약 안됨.');
      callback(undefined, user.data);
      return;
    }
  }

  var postData = {
    Userid: user.id,
    Userpw: user.pw,
    x: 0,
    y: 0
  };

  request({
    url: checkReserveUrl,
    method: 'POST',
    form: postData,
  }, function(error, response, body) {
    if(error) {
      var errMsg = 'checkReserve: ' + error;
      co.error(errMsg);
      callback(errMsg);
      return;
    }
    if(response.statusCode !== 200) {
      var errMsg = 'checkReserve: Invalid Status Code Returned: ' + response.statusCode;
      co.error(errMsg);
      callback(errMsg);
      return;
    }

    jsdom.env({
      html: body,
      src: [jquery],
      done: function(err, window) {
        var $ = window.$;

        if(err) {
          callback(err);
          return;
        }

        var data = {};

        $('input').each(function(index) {
          data[$(this).attr('name')] = $(this).attr('value');
        });

        user.data = data;
        callback(undefined, data);
      }
    });
  });
};



var cancelUrl = 'http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_Cancel.php';
/**
 * 예약 취소.
 * @param  {[type]}   user
 * @param  {Function} callback (error, msg)
 */
var cancel = function(user, callback) {
  checkReserve(user, function(err, data) {
    delete user.data;

    if(err) {
      callback(co.error('cancel', err));
      return;
    }

    request({
      url: cancelUrl,
      method: 'POST',
      form: data,
    }, function(error, response, body) {
      if(error) {
        callback(co.error('cancel', error));
        return;
      }
      if(response.statusCode !== 200) {
        var errMsg = co.error('cancel', 'Invalid Status Code Returned: ' +
          response.statusCode);
        callback(errMsg);
        return;
      }

      if(body.search('parent.win.in_alert2') === -1) {
        callback(undefined, co.log(user.id, '예약취소가 제대로 안된것 같다.'));
      } else {
        callback(undefined, co.log(user.id, '예약취소 완료.'));
      }
    });
  });
}



/**
 * 예약 가능한 유저 반환.
 * @param  {[type]}   users    예약 가능한지 채크할 유저.
 * @param  {Function} callback (user) // 예약 가능한 유저.
 */
var ableReserveUser = function(users, callback) {
  var process = function(index) {
    if(users.length <= index) {
      callback(null);
      return;
    }

    checkReserve(users[index], function(err, data) {
      if(!err && !data['seat[1][rsrv_seq]']) {
        callback(users[index]);
      } else {
        process(index + 1);
      }
    });
  }

  process(0);
};

/**
 * options = {
 *   from: 'bynaki <bynaki@icloud.com>',
 *   to: 'bynaki@icloud.com',
 *   subject: 'Hello',
 *   text: 'Hello World',
 *   html: '<h1>Hello World</h1>',
 * }
 */
function sendMail(options, callback) {
  if(!sendMail.transporter) {
    const mail = querystring.escape(`${db.from.id}@gmail.com`);
    const pwd = querystring.escape(db.from.pw);
    const smtp = `smtps://${mail}:${pwd}@smtp.gmail.com`;
    sendMail.transporter = nodemailer.createTransport(smtp);
  }
  sendMail.transporter.sendMail(options, callback);
}


/**
 * 예약 이메일 보내기.
 */
function sendMailReserve({
  seatId,
  ranges,
}, callback) {
  const from = `${db.from.id} <${db.from.id}@gmail.com>`;
  const to = db.to;
  const times = ranges.map((range) => {
    const front = co.toTimeByTick(range[0], true, true);
    const end = co.toTimeByTick(range[1], false, true);
    // console.log(`front: ${front}, end: ${end}`);
    return `${front} - ${end}`;
  });
  const html = '<h2>예 약</h2>' +
               '<p>' +
               '  <strong>좌석:</strong> <br />' +
               `  ${seatId - co.START_ID + 1}번 좌석` +
               '</p>' +
               '<p>' +
               '  <strong>시간:</strong> <br />' +
               `  ${times.join(' <br />')}` +
               '</p>';
   const mailOptions = {
    from,
    to,
    subject: `${seatId - co.START_ID + 1}번 좌석 예약`,
    html,
  }
  sendMail(mailOptions, callback);
}



module.exports = {
  Tandem: Tandem,
  getUserById: getUserById,
  jquery: jquery,
  seatData: seatData,
  ableReserveUser: ableReserveUser,
  reserve: reserve,
  checkReserve: checkReserve,
  cancel: cancel,
  sendMail,
  sendMailReserve,
};
