/**
 * 비동기처리를 순차적으로 처리하기 위한 (동기적으로..) Chain 클래스
 * @class
 * @example <caption> 사용 예:</caption>
 * var chain = new Chain();
 *  
 * chain.push(function(next) {
 *     Model.Group.findOne({name: 'foo'}, function(err, doc) {
 *         if(err) {
 *             next(err);
 *             return;
 *         }
 *         console.log(doc);
 *         next();
 *     });
 * });
 *  
 * chain.exec(function(err) {
 *     if(err) {
 *         console.log(err);
 *         return;
 *     }
 *     console.log('success!!');
 * });
 */


function Chain() {
  this.items = new Array();
}


Chain.prototype = {
  /**
   * 처리함수(callback)를 순차적으로 등록한다.
   * @param  {Function} callback 실행할 callback(next) 함수.
   * @return {Chain}            Chain 그 자신.
   */
  push: function(callback) {
    this.items.push(callback);
    return this;
  },

  /**
   * 등록한 처리 함수들을 순차적으로 실행한다.
   * error가 있으면 callback에 에러 메시지를 전달 한고 중지시킨다.
   * @param  {Function} callback 에러가 있거나 모든 처리를 마쳤을때 실행된다. callback(error)
   */
  exec: function(callback) {
    var items = this.items;

    function next(err) {
      var fun;
      if(err || !(fun = items.shift())) {
        if(callback) callback(err);
        return;
      }

      fun(next);
    }

    next();
  }
};



if(typeof (module) === 'object') {
  module.exports = Chain;
}
