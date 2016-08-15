var Immutable = require('immutable');
var Model = require('./../index.js');

var dummyController = {
  on: function () {

  }
};

var data, immutableData, model;


exports['should be able to set initial state correctly'] = function (test) {
  data = {
    foo: 'bar',
    admin: {
      list: ['foo', 'bar']
    }
  };
  immutableData = Immutable.fromJS(data);
  model = Model(data)(dummyController);

  test.equal(model.accessors.get(['foo']), 'bar');
  test.deepEqual(model.accessors.get(), immutableData);
  test.deepEqual(model.accessors.get(['admin']), Immutable.fromJS(data.admin));
  test.done();
};

exports['should be able to SET state'] = function (test) {
  var data = {
    foo: 'bar',
    admin: {
      foo: 'bar'
    }
  }
  var model = Model({})(dummyController);
  model.mutators.set(['foo'], 'bar2');
  model.mutators.set(['admin.foo'], 'bar2');
  model.mutators.set(['admin.deep.nest'], Immutable.fromJS(data));
  test.equal(model.accessors.get(['foo']), 'bar2');
  test.equal(model.accessors.get(['admin.foo']), 'bar2');
  test.deepEqual(model.accessors.get(['admin.deep.nest']), Immutable.fromJS(data));
  test.done();
};

exports['should be able to UNSET state'] = function (test) {
  var model = Model({
    foo: 'bar',
    admin: {
      key1: 'bar',
      key2: 'bar'
    }
  })(dummyController);
  model.mutators.unset(['foo']);
  model.mutators.unset(['admin'], ['key1', 'key2']);
  test.deepEqual(model.accessors.get([]).toJS(), {admin: {}});
  test.done();
};

exports['should be able to PUSH state'] = function (test) {
  var model = Model({
    list: [],
    admin: {
      list: []
    }
  })(dummyController);
  model.mutators.push(['list'], 'foo');
  model.mutators.push(['admin.list'], 'foo');
  test.equal(model.accessors.get(['list.0']), 'foo');
  test.equal(model.accessors.get(['admin.list.0']), 'foo');
  test.done();
};

exports['should be able to SPLICE state'] = function (test) {
  var model = Model({
    list: [],
    admin: {
      list: ['foo']
    }
  })(dummyController);
  model.mutators.splice(['list'], 0, 0, 'foo');
  model.mutators.splice(['admin.list'], 0, 1, 'bar');
  test.equal(model.accessors.get(['list.0']), 'foo');
  test.equal(model.accessors.get(['admin.list.0']), 'bar');
  test.done();
};

exports['should be able to MERGE state'] = function (test) {
  var model = Model({
    admin: {
      foo: 'bar'
    }
  })(dummyController);
  model.mutators.merge(['admin'], {bar: 'test'});
  test.deepEqual(model.accessors.get(['admin']).toJS(), {foo: 'bar', bar: 'test'});
  test.done();
};

exports['should be able to CONCAT state'] = function (test) {
  var model = Model({
    admin: {
      list: []
    }
  })(dummyController);
  model.mutators.concat(['admin.list'], ['foo']);
  test.equal(model.accessors.get(['admin.list.0']), 'foo');
  test.done();
};

exports['should be able to POP state'] = function (test) {
  var model = Model({
    list: ['foo', 'bar']
  })(dummyController);
  model.mutators.pop(['list']);
  test.deepEqual(model.accessors.get(['list']).toJS(), ['foo']);
  test.done();
};

exports['should be able to SHIFT state'] = function (test) {
  var model = Model({
    list: ['foo', 'bar']
  })(dummyController);
  model.mutators.shift(['list']);
  test.deepEqual(model.accessors.get(['list']).toJS(), ['bar']);
  test.done();
};

exports['should be able to UNSHIFT state'] = function (test) {
  var model = Model({
    list: ['foo', 'bar']
  })(dummyController);
  model.mutators.unshift(['list'], 'foo2');
  test.deepEqual(model.accessors.get(['list']).toJS(), ['foo2', 'foo', 'bar']);
  test.done();
};

exports['should be able to IMPORT state'] = function (test) {
  var model = Model({
    list: ['foo', 'bar'],
    admin: {
      test: 'hest'
    }
  })(dummyController);
  model.mutators.import({
    admin: {
      foo: 'bar'
    }
  });
  test.deepEqual(model.accessors.get([]).toJS(), {
    list: ['foo', 'bar'],
    admin: {
      foo: 'bar',
      test: 'hest'
    }
  });
  test.done();
};