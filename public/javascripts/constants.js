var co = {};


(function() {


  var START_ID = 69; // 노트북1 아이디.
  var END_ID = 92; // 노트북 마지막 자리 아이디.
  var BASE_START_TIME = 6; // 시스템적 시작 시각.
  var LIB_HOURS = 16; // 시스템적 운영 시간.
  var TICKS_OF = 6; // 한시간에 틱 이 몇개.
  var LIMITED_TICKS = 18; // 예약할 수 있는 최대 틱.
  var START_TIME = 9; // 노원도서관 운영 시작 시각.
  var END_TIME = 19; // 노원도서관 운영 마지막 시각.
  // 노원도서관 운영 시작 틱.
  var START_TICK = (START_TIME - BASE_START_TIME) * TICKS_OF + 1;
  // 노원도서관 운영 마지막 틱.
  var END_TICK = (END_TIME - BASE_START_TIME + 1) * TICKS_OF;

  /**
   * 좌석 틱 바.
   */
  var Bar = {
    unknown: 'bar_unknown', // 알수 없는 바.
    orange: 'bar_orange', // 예약된 바.
    black: 'bar_black', // 예약 불가 바.
    gray: 'bar_gray', // 지난 시간 바.
    green: 'bar_green', // 예약할 수 있는 바.
    red: 'bar_red', // 내가 예약한 바.
    blue: 'bar_blue' // 내일 예약 바.
  };


  /**
   * Log.
   */
  var log = function() {
    var args = '';
    for(var i = 0; i < arguments.length; i++) {
      args += arguments[i];
      if(i < arguments.length - 1) {
        args += ' > ';
      }
    }
    var msg = 'Log :: ' + (new Date()).toLocaleString() +
      ' :: ' + args;
    console.log(msg);
    return msg;
  };


  /**
   * Error Log.
   */
  var error = function() {
    var args = '';
    for(var i = 0; i < arguments.length; i++) {
      args += arguments[i];
      if(i < arguments.length - 1) {
        args += ' > ';
      }
    }
    var msg = 'Error :: ' + (new Date()).toLocaleString() +
      ' :: ' + args;
    console.log(msg);
    return msg;
  }


  /**
   * Number 를 String 으로. 1자리 수라면 앞에 0을 붙여서.
   * @param  {Number} num 문자로 변환할 숫자.
   * @return {String}     문자로 변환된 숫자.
   */
  var toStringNum = function(num) {
    var zero = (num < 10) ? '0' : '';
    return zero + num;
  };


  /**
   * 예약할 우선 순위 좌석 아이디 부여.
   * @param  {Number} order 순서.
   * @return {String}       부여된 아이디.
   */
  var makeOrderId = function(order) {
    return 'order' + toStringNum(order);
  };


  /**
   * 틱바에 아이디 부여.
   * @param  {[type]} order 순서.
   * @param  {[type]} tick  틱.
   * @return {[type]}       부여된 아이디.
   */
  var makeTickId = function(order, tick) {
    return makeOrderId(order) + '_t' + toStringNum(tick);
  };


  /**
   * 보여줄 버튼 아이디 부여.
   * @param  {[type]} id 좌석 아이디.
   * @return {[type]}    부여된 아이디.
   */
  var makeShowId = function(id) {
    return 'show' + toStringNum(id);
  };


  var makeTomorrowId = function(tick) {
    return 'tomorrow_t' + toStringNum(tick);
  };


  var toTimeByTick = function(tick, front, colon) {
    var opt = (front) ? 1 : 0;
    var hh = Math.floor((tick - opt) / TICKS_OF) + BASE_START_TIME;
    var mm = ((tick - opt) % TICKS_OF) * 10;
    var time = toStringNum(hh);
    time += (colon) ? ':' : '';
    time += toStringNum(mm);

    return time;
  };


  var toTickByTime = function(time, front) {
    var hh = parseInt(time.slice(0, 2));
    var tick = parseInt(time[2]) + ((front) ? 1 : 0);
    tick += ((hh - BASE_START_TIME) * TICKS_OF);

    return tick;
  };


  var getOrderByTickId = function(tickId) {
    var split = tickId.split('_t');
    return parseInt(split[0].replace('order', ''));
  };


  var getOrderByOrderId = function(seatId) {
    return parseInt(seatId.replace('order', ''));
  };


  var getTickByTickId = function(tickId) {
    var split = tickId.split('_t');
    return parseInt(split[1]);
  };


  var getSeatIdByShowId = function(showId) {
    return parseInt(showId.replace('show', ''));
  };


  var getTickByTomorrowId = function(tId) {
    return parseInt(tId.split('_t')[1]);
  };


  var tagReservedUser = function(userId, backward) {
    if(backward) {
      if(userId.split('_')[0] === 'reserved') {
        return userId.split('_')[1];
      }
    } else {
      return 'reserved_' + userId;
    }

    return null;
  };



  var ShowList = function(data) {
    this.setData(data);
  }


  ShowList.prototype = {
    push: function(id) {
      this.data.push(id);
    },

    del: function(id) {
      for(var i = 0; i < this.data.length; i++) {
        if(this.data[i] == id) {
          return this.data.splice(i, 1);
        }
      }
    },

    getData: function() {
      return this.data;
    },

    setData: function(data) {
      if(data) {
        this.data = data;
      } else {
        this.data = [];
      }
    },

    hasId: function(id) {
      for(var i = 0; i < this.data.length; i++) {
        if(this.data[i] == id) {
          return i;
        }
      }
      return -1;
    },

    getId: function(order) {
      return this.data[order];
    },

    count: function() {
      return this.data.length;
    }
  };


  var RangeList = function(data) {
    this.setData(data);
  };


  RangeList.prototype = {
    setData: function(data) {
      if(data) {
        this.data = data;
      } else {
        this.data = {};
      }
    },

    getData: function() {
      return this.data;
    },

    push: function(start, end) {
      var index = 0;
      while(this.data[index++]) {}
      if(end === undefined) {
        this.data[index - 1] = start[0] + ':' + start[1];
      } else {
        this.data[index - 1] = start + ':' + end;
      }
    },

    getRange: function(index) {
      var range = this.data[index];
      range = range.split(':');
      return [parseInt(range[0]), parseInt(range[1])];
    },

    count: function() {
      var index = 0;
      while(this.data[index++]) {}
      return index - 1;
    }
  };



  /**
   * users: [{id, pw}, ...],
   * from: {id, pw},
   * to: email,
   */
  var db = {
    users: [],
    showList: new ShowList(),
    tomorrowRangeList: []
  };


  co = {
    START_ID: START_ID,
    END_ID: END_ID,
    BASE_START_TIME: BASE_START_TIME,
    LIB_HOURS: LIB_HOURS,
    TICKS_OF: TICKS_OF,
    LIMITED_TICKS: LIMITED_TICKS,
    START_TIME: START_TIME,
    END_TIME: END_TIME,
    START_TICK: START_TICK,
    END_TICK: END_TICK,
    Bar: Bar,

    log: log,
    error: error,
    toStringNum: toStringNum,
    makeTickId: makeTickId,
    makeShowId: makeShowId,
    makeTomorrowId: makeTomorrowId,
    makeOrderId: makeOrderId,
    toTimeByTick: toTimeByTick,
    toTickByTime: toTickByTime,
    getOrderByTickId: getOrderByTickId,
    getOrderByOrderId: getOrderByOrderId,
    getTickByTickId: getTickByTickId,
    getSeatIdByShowId: getSeatIdByShowId,
    getTickByTomorrowId: getTickByTomorrowId,
    tagReservedUser: tagReservedUser,
    ShowList: ShowList,
    RangeList: RangeList,
    db: db
  };


}());


if(typeof(module) === 'object') {
  module.exports = co;
}