/**
 * test
 * 
 * secretdata.json 이 필요하다.
 */

const nowon = require('../nowonlib');
const co = require('../public/javascripts/constants');
const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

/**
 * secretdata = {
 *  from: {id, pw},
 *  to: email,
 * }
 */
const sd = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '../secretdata.json'
)));


describe('send mail', function() {
  this.timeout(4000);

  before(() => {
    co.db.from = sd.from;
    co.db.to = sd.to;
  });

  // it('sendMail()', (done) => {
  //   var options = {
  //     from: 'bynaki <bynaki@icloud.com>',
  //     to: 'bynaki@icloud.com',
  //     subject: 'Hello',
  //     text: 'Hello World',
  //     html: '<h1>Hello World</h1>',
  //   };
  //   nowon.sendMail(options, (err, info) => {
  //     expect(err).to.be.not.ok;
  //     expect(info).to.be.ok;
  //     console.log(info);
  //     done();
  //   });
  // });

  it('sendMailReserve()', (done) => {
    const ranges = [];
    ranges.push([co.toTickByTime('0900', true)
      , co.toTickByTime('1100', false)]);
    ranges.push([co.toTickByTime('1330', true)
      , co.toTickByTime('1530', false)]);
    console.log(ranges);
    const options = {
      seatId: co.START_ID,
      ranges,
    };
    nowon.sendMailReserve(options, (err, info) => {
      expect(err).to.be.not.ok;
      expect(info).to.be.ok;
      console.log(info);
      done();
    });
  });
});
