$(document).ready(function() {
  $('#data').click(function() {
    $.get('/data', {
      startId: 69,
      endId: 69
    }, function(data) {
      console.log(data);
    });
  });

  $('#put_tomorrow').click(function() {
    var rangeList = new co.RangeList();
    rangeList.push(0, 23);
    rangeList.push(24, 43);
    rangeList.push(44, 54);

    console.log(rangeList.getData());

    $.ajax({
      url: '/tomorrow',
      type: 'PUT',
      dataType: 'json',
      data: rangeList.getData(),
      success: function(data) {
        if(data.error) {
          console.log('Error > ', data.error);
          return;
        }
        console.log(data.data);
      }
    });
  });


  var array = [];
  for(var i = 0; i < 10; i++) {
    array[i] = i + 10;
  }
  array['foo'] = 'bar';
  $('#array').click(function() {
    $.ajax({
      url: '/test/array/' + JSON.stringify(array),
      type: 'get',
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  });


  // $.ajaxSetup({
  //     contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
  // });
  // $.ajaxSetup({
  //     contentType: 'application/json; charset=UTF-8'
  // });

  $('#post_array').click(function() {
    $.ajax({
      url: '/test/array',
      type: 'post',
      // dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify(array),
      success: function(data) {
        console.log(data)
      }
    });
  });
});