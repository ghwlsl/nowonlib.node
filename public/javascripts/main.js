'use strict';


var hasClasses = function(dom, classes) {
  var has = true;
  for(var i in classes) {
    if(!dom.hasClass(classes[i])) {
      has = false;
      break;
    }
  }

  return has;
};


var tickRangeList = function(prefix, classes) {
  var tickCount = co.LIB_HOURS * co.TICKS_OF;
  var rangeList = [];
  var start = null;

  for(var tick = 1; tick <= tickCount; tick++) {
    var tId = prefix + '_t' + co.toStringNum(tick);
    var dom = $('#' + tId);
    if(dom.length !== 0 && hasClasses(dom, classes)) {
      if(start === null) {
        start = tick;
      }
    } else if(start !== null) {
      rangeList.push([start, tick - 1]);
      start = null;
    }
  }

  if(start !== null) {
    rangeList.push([start, tick - 1]);
  }

  return rangeList;
};


var getIncludedTickRange = function(rangeList, tick) {
  for(var i = 0; i < rangeList.length; i++) {
    var range = rangeList[i];
    if(tick >= range[0] && tick <= range[1]) {
      return range;
    }
  }
  return null;
};


var getClasses = function(dom) {
  return dom.attr('class').split(' ');
};


var initBar = function(start, end) {
  if(end === undefined) {
    end = start;
  }

  for(var num = start; num <= end; num++) {
    if(num < db.showList.count()) {
      $('#' + co.makeOrderId(num) + '_title').text('노트북' +
        co.toStringNum(parseInt(db.showList.getId(num)) -
          co.START_ID + 1));
    } else {
      $('#' + co.makeOrderId(num) + '_title').text('');
    }
    for(var tick = 1; tick <= co.LIB_HOURS * co.TICKS_OF; tick++) {
      var dom = $('#' + co.makeTickId(num, tick));
      if(dom.length !== 0) {
        var classes = getClasses(dom);
        for(var i in classes) {
          if(classes[i] !== 'bar' && classes[i] !== 'seat_bar') {
            dom.removeClass(classes[i]);
          }
        }
      }
    }
  }
};


var showBar = function(count) {
  for(var i = 0; i < count; i++) {
    $('#' + co.makeOrderId(i)).removeClass('hide');
  }
  for(var i = count; i <= (co.END_ID - co.START_ID); i++) {
    $('#' + co.makeOrderId(i)).addClass('hide');
  }
};


var drawBar = function(seatIds, callback) {
  $.ajax({
    url: '/data/' + JSON.stringify(seatIds),
    type: 'GET',

    success: function(data, textStatus, jqXHR) {
      if(data.error) {
        errMsg(data.error);
        return;
      }

      for(var i = 0; i < seatIds.length; i++) {
        var id = seatIds[i];
        var order = db.showList.hasId(id);
        if(order !== -1) {
          for(var tick = 1; tick <= co.LIB_HOURS * co.TICKS_OF; tick++) {
            $('#' + co.makeTickId(order, tick)).addClass(data.data[id][tick]);
            if(data.data[id][tick].split('_')[0] === 'reserved') {
              $('#' + co.makeTickId(order, tick)).addClass(co.Bar.red);
            }
          }
        }
      }

      if(callback) callback();
    },

    error: function(jqXHR, textStatus, errorThrown) {
      errMsg(co.error('main.drawbar', textStatus));
    }
  });
};


var clearSelected = function() {
  $('li.seat_bar').removeClass('bar_selected');
};


var reserve = function(order, tickRange) {
  initBar(order);
  var seatId = db.showList.getId(order);

  $.post('/reserve', {
    seat_id: seatId,
    Hsvar: tickRange[0],
    Hevar: tickRange[1]
  }, function(data) {
    drawBar([seatId], function() {
      if(data.error) {
        errMsg(data.error);
      } else {
        logMsg(data.data);
      }
    });
  });
};


var cancel = function(order, userId) {
  initBar(order);
  var seatId = db.showList.getId(order);

  $.post('/cancel', {
    Userid: userId
  }, function(data) {
    drawBar([seatId], function() {
      if(data.error) {
        errMsg(data.error);
      } else {
        logMsg(data.data);
      }
    });
  });
};


var logMsg = function(msg) {
  $('#msg_bar').text(msg);
  $('#msg_bar').removeClass('error_msg');
};


var errMsg = function(msg) {
  $('#msg_bar').text(msg);
  $('#msg_bar').addClass('error_msg');
};


var db = co.db;

var getShowSeat = function(callback) {
  $.post('/show_seat', function(data) {
    if(data.error) {
      errMsg(data.error);
      return;
    }

    db.showList.setData(data.data);
    drawShowButton(db.showList);

    if(callback) callback();
  });
};


var saveShowSeat = function(callback) {
  $.ajax({
    url: '/show_seat',
    type: 'PUT',
    data: {
      data: db.showList.getData()
    },
    success: function(data) {
      if(data.error) {
        errMsg(data.error);
      } else {
        logMsg(data.data);
      }

      getShowSeat(callback);
    }
  });
};


var drawShowButton = function(showList) {
  $('li.show_button').each(function() {
    var showId = $(this).attr('id');

    if(showId !== 'show_ok') {
      var order = showList.hasId(co.getSeatIdByShowId(showId));
      if(order !== -1) {
        $(this).addClass('show_selected');
        $('span.show_order', this).text(co.toStringNum(order + 1));
      } else {
        $(this).removeClass('show_selected');
        $('span.show_order', this).text('');
      }
    }
  });
};



var saveTomorrow = function() {
  var rangeList = tickRangeList('tomorrow', ['bar', 'tomorrow_bar', 'bar_blue']);

  // $.ajaxSetup({
  //     contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
  // });
  // $.ajaxSetup({
  //     contentType: 'application/json; charset=UTF-8'
  // });
  $.ajax({
    url: '/tomorrow',
    type: 'PUT',
    // dataType: 'json',
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify(rangeList),
    success: function(data) {
      if(data.error) {
        errMsg(data.error);
        initTomorrowBar();
        drawTomorrowOnOff();
        return;
      }
      logMsg(data.data);
      drawTomorrow();
      drawTomorrowOnOff();
    }
  });
};


var drawTomorrow = function() {
  $.get('/tomorrow', function(data) {
    if(data.error) {
      errMsg(data.error);
      return;
    }

    var rangeList = data.data;
    for(var tick = 1; tick <= co.LIB_HOURS * co.TICKS_OF; tick++) {
      if(getIncludedTickRange(rangeList, tick)) {
        $('#' + co.makeTomorrowId(tick)).addClass('bar_blue');
      } else {
        $('#' + co.makeTomorrowId(tick)).removeClass('bar_blue');
      }
    }
  });
};


var initTomorrowBar = function() {
  $('li.tomorrow_bar').removeClass('bar_blue');
};


var tomorrowOnOff = function(onOff) {
  $.ajax({
    url: '/tomorrow/on_off',
    type: 'PUT',
    data: {
      onOff: onOff
    },
    success: function(data) {
      if(data.error) {
        errMsg(data.error);
      } else {
        logMsg(data.data);
      }
      drawTomorrowOnOff();
    }
  });
};


var drawTomorrowOnOff = function() {
  $.get('/tomorrow/on_off', function(data) {
    if(data.error) {
      errMsg(data.error);
      return;
    }

    if(data.data === 'on') {
      $('#tomorrow_btn').addClass('tomorrow_on');
    } else {
      $('#tomorrow_btn').removeClass('tomorrow_on');
    }
  });
};


/**
 * userdata = {
 *  users: [{id}, ...],
 *  from: {id},
 *  to: mail,
 * }
 */
function getUserData(callback) {
  $.get('/userdata', function(data) {
    if(data.error) {
      errMsg(data.error);
    }
    callback(data.error, data.data);
  });
}


/**
 * userdata = {
 *  users: [{id, pw}, ...],
 *  from: {id, pw},
 *  to: mail,
 * }
 */
function setUserData(userdata, callback) {
  $.ajax({
    url: '/userdata',
    type: 'PUT',
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify(userdata),
    success: function(data) {
      if(data.error) {
        errMsg(data.error);
      }
      callback(data.error, data.data);
    }
  });
}


function getStorageUserdata() {
  var raw = localStorage.getItem('userdata');
  return (raw)? JSON.parse(raw) : {users: []};
}


function setStorageUserdata(userdata) {
  localStorage.setItem('userdata', JSON.stringify(userdata));
  console.log(`userdata: ${JSON.stringify(userdata)}`);
}


$(document).ready(function() {
  $('#signin-modal').on('show.bs.modal', function(event) {
    var modal = $(this);
    var userInputs = modal.find('#form-nowonuser input').val('');
    var fromUserInput = modal.find('#from-user').val('');
    var fromPwdInput = modal.find('#from-pwd').val('');
    var toMailInput = modal.find('#to-mail').val('');

    getUserData(function(err, ud) {
      if(err) {
        return;
      }
      var storUserdata = getStorageUserdata();
      if(ud.users.length === 0) {
        ud.users = storUserdata.users;
      } else {
        ud.users = ud.users.map(function(user, index) {
          storUserdata.users.some(function(u, n) {
            if(u.id === user.id) {
              user.pw = u.pw;
              return true;
            }
            return false;
          });
          return user;
        });
      }
      if(!ud.from) {
        ud.from = storUserdata.from;
      } else if(ud.from.id === storUserdata.from.id) {
        ud.from.pw = storUserdata.from.pw;
      }
      if(!ud.to) {
        ud.to = storUserdata.to;
      }
      ud.users.forEach(function(user, n) {
        $(userInputs[2 * n]).val(user.id);
        $(userInputs[2 * n + 1]).val(user.pw);
      });
      if(ud.from) {
        fromUserInput.val(ud.from.id);
        fromPwdInput.val(ud.from.pw);
      }
      toMailInput.val(ud.to);
    });
  });
  
  $('#save-confirm').click(function() {
    var users = [{}, {}, {}];
    var modal = $('#signin-modal');
    modal.find('#form-nowonuser input').each(function(n) {
      if((n % 2) == 0) {
        users[n / 2].id = $(this).val();
      } else {
        users[(n - 1) / 2].pw = $(this).val();
      }
    });
    users = users.filter(function(user) {
      return user.id && user.pw;
    });
    var from = {
      id: modal.find('#from-user').val(),
      pw: modal.find('#from-pwd').val()
    }
    from = (from.id && from.pw)? from : undefined;
    var to = modal.find('#to-mail').val();
    if(users.length === 0) {
      errMsg(co.error('User 데이터가 없거나 잘못되었다.'));
    } else {
      $('#signin-modal').modal('hide');
      setUserData({
        users,
        from,
        to
      }, function(err, msg) {
        if(err) {
          return;
        }
        setStorageUserdata({users, from, to});
        logMsg(msg);
      });
    }
  });

  getUserData(function(err, userdata) {
    if(userdata.users.length === 0) {
      $('#signin-modal').modal('show');
    }
  });


  getShowSeat(function() {
    initBar(0, db.showList.count() - 1);
    showBar(db.showList.count());
    drawBar(db.showList.getData());
  });

  drawTomorrow();
  drawTomorrowOnOff();

  $('#tomorrow_btn').click(function() {
    if($(this).hasClass('tomorrow_on')) {
      tomorrowOnOff('off');
    } else {
      tomorrowOnOff('on');
    }
    // drawTomorrowOnOff();
  });

  $('li.tomorrow_bar').click(function() {
    if($(this).hasClass('bar_blue')) {
      var tick = co.getTickByTomorrowId($(this).attr('id'));
      var rangeList = tickRangeList(
        'tomorrow', getClasses($(this)));
      var inRange = getIncludedTickRange(rangeList, tick);

      for(var tick = inRange[0]; tick <= inRange[1]; tick++) {
        var dom = $('#' + co.makeTomorrowId(tick));
        dom.removeClass('bar_blue');
      }

      saveTomorrow();
    } else {
      var tomorrowId = $(this).attr('id');
      var tick = co.getTickByTomorrowId(tomorrowId);

      for(var tt = tick; tt < tick + co.LIMITED_TICKS; tt++) {
        var tId = co.makeTomorrowId(tt);
        var dom = $('#' + co.makeTomorrowId(tt));
        if(dom.hasClass('bar_blue')) {
          break;
        } else {
          dom.addClass('bar_blue');
        }
      }

      saveTomorrow();
    }
  });

  $('li.show_button').click(function() {
    if($(this).hasClass('show_selected')) {
      db.showList.del(co.getSeatIdByShowId($(this).attr('id')));
      drawShowButton(db.showList);
    } else if($(this).attr('id') !== 'show_ok') {
      db.showList.push(co.getSeatIdByShowId($(this).attr('id')));
      drawShowButton(db.showList);
    }

    if($(this).attr('id') === 'show_ok') {
      showBar(db.showList.count());
      initBar(0, co.END_ID - co.START_ID);
      saveShowSeat(function() {
        showBar(db.showList.count());
        drawBar(db.showList.getData());
      });
    }
  });

  $('li.seat_bar').click(function() {
    if($(this).hasClass('bar_selected')) {
      var order = co.getOrderByTickId($(this).attr('id'));

      if($(this).hasClass(co.Bar.green)) {
        var tick = co.getTickByTickId($(this).attr('id'));
        var rangeList = tickRangeList(
          co.makeOrderId(order), getClasses($(this)));
        var inRange = getIncludedTickRange(rangeList, tick);
        reserve(order, inRange)
      } else if($(this).hasClass(co.Bar.red)) {
        var classes = getClasses($(this));
        for(var i in classes) {
          var userId = co.tagReservedUser(classes[i], true);
          if(userId) {
            cancel(order, userId);
            break;
          }
        }
      } else {
        clearSelected();
      }
    } else {
      clearSelected();

      if($(this).hasClass(co.Bar.green)) {
        var tickId = $(this).attr('id');
        var order = co.getOrderByTickId(tickId);
        var tick = co.getTickByTickId(tickId);

        for(var tt = tick; tt < tick + co.LIMITED_TICKS; tt++) {
          var tId = co.makeTickId(order, tt);
          var obj = $('#' + tId);
          if(obj.length !== 0 && obj.hasClass(co.Bar.green)) {
            obj.addClass('bar_selected');
          } else {
            break;
          }
        }
      } else if($(this).hasClass(co.Bar.red)) {
        var order = co.getOrderByTickId($(this).attr('id'));
        var tick = co.getTickByTickId($(this).attr('id'));
        var rangeList = tickRangeList(
          co.makeOrderId(order), getClasses($(this)));
        var inRange = getIncludedTickRange(rangeList, tick);

        for(var tt = inRange[0]; tt <= inRange[1]; tt++) {
          $('#' + co.makeTickId(order, tt)).addClass('bar_selected');
        }
      }
    }
  });
});