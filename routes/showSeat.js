/**
 * 보여줄 좌석 서비스.
 */


'use strict';


var express = require('express');
var router = express.Router();

var co = require('../public/javascripts/constants');
var db = co.db;


// req: .
// res: {error: error, data: showList}
router.post('/', function(req, res, next) {
  res.json({
    data: db.showList.getData()
  });
});


// req: data[]=[seat_id1, seat_id2, ...]
// res: {error: error, data: msg}
router.put('/', function(req, res, next) {
  var data = req.body['data[]'];
  if(!data) {
    data = [];
  } else if(typeof(data) === 'string') {
    data = [data];
  }
  db.showList.setData(data);
  res.json({
    data: co.log(
      '/show_seat', '보여줄 노트북 좌석 저장 완료.')
  });
});


module.exports = router;
