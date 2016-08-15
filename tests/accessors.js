var Immutable = require('immutable');
var Model = require('./../index.js');

var dummyController = {
  on: function () {

  }
};

var data, immutableData, model;

exports['should be able to GET state'] = function (test) {
  data = {
    foo: 'bar',
    admin: {
      list: ['foo', 'bar']
    }
  };
  immutableData = Immutable.fromJS(data);

  model = Model({
    foo: 'bar',
    admin: {
      list: ['foo', 'bar']
    }
  })(dummyController);
  test.deepEqual(model.accessors.get(), immutableData);
  test.deepEqual(model.accessors.get([]), immutableData);
  test.deepEqual(model.accessors.get(undefined), immutableData);
  test.deepEqual(model.accessors.get(['foo']), 'bar');
  test.deepEqual(model.accessors.get(['admin.list.1']), 'bar');
  test.deepEqual(model.accessors.get(['admin', 'list', 1]), 'bar');
  test.done();
};

exports['should be able to EXPORT state'] = function (test) {

  var exportedState = model.accessors.export();
  test.deepEqual(exportedState, {
    foo: 'bar',
    admin: {
      list: ['foo', 'bar']
    }
  });
  test.done();
};

exports['should be able to get KEYS of state'] = function (test) {
  var model = Model({
    foo: {
      key1: 'bar',
      key2: 'bar'
    }
  })(dummyController);
  test.deepEqual(model.accessors.keys(['foo']), ['key1', 'key2']);
  test.done();
};

exports['should be able to FIDNWHERE of state'] = function (test) {
  var model = Model({
    list: [{
      id: '1'
    }, {
      id: '2',
      foo: 'bar'
    }, {
      id: '2'
    }]
  })(dummyController);
  test.deepEqual(model.accessors.findWhere(['list'], {id: '1'}).toJS(), {
    id: '1'
  });
  test.deepEqual(model.accessors.findWhere(['list'], {id: '2'}).toJS(), {
    id: '2',
    foo: 'bar'
  });
  test.done();
};
