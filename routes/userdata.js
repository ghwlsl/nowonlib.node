
var express = require('express');
var router = express.Router();

var co = require('../public/javascripts/constants');
var db = co.db;


router.get('/', function(req, res, next) {
  var users = db.users.map(function(user) {
    return {id: user.id};
  });
  var from = (db.from)? {id: db.from.id} : undefined;
  var to = (db.to)? db.to : undefined;
  co.log('/userdata.get', `users: ${users.join('; ')}, from: ${from}, to: ${to}`);
  res.json({
    data: {users, from, to}
  });
});


router.put('/', function(req, res, next) {
  var userdata = req.body;
  db.users = userdata.users;
  db.from = userdata.from;
  db.to = userdata.to;
  var users = db.users.map(function(user) {
    return user.id;
  });
  co.log('/userdata.put'
    , `users: ${users.join('; ')}, from: ${db.from}, to: ${db.to}`);
  res.json({
    data: co.log('User 데이터 저장 성공.')
  });
});


module.exports = router;
