var Immutable = require('immutable');

var Model = function (initialState) {

  var state = Immutable.fromJS(initialState);

  var model = function (controller) {

    controller.on('reset', function () {
      state = Immutable.fromJS(initialState);
    });

    controller.on('seek', function (seek, recording) {
      recording.initialState.forEach(function (stateUpdate) {
        state = state.setIn(stateUpdate.path, Immutable.fromJS(stateUpdate.value));
      });
    });

    return {
        logModel: function () {
          return state.toJS();
        },
        accessors: {
          get: function (path) {
            return state.getIn(path);
          },
          toJS: function (path) {
            return state.getIn(path).toJS();
          },
          export: function () {
            return state.toJS();
          },
          keys: function (path) {
            return state.getIn(path).keySeq().toArray();
          },
          findWhere: function (path, predicate) {
            var keysCount = Object.keys(predicate).length;
            return state.getIn(path).find(function (item) {
              return item.keySeq().toArray().filter(function (key) {
                return key in predicate && predicate[key] === item.get(key);
              }).length === keysCount;
            });
          }
        },

        // Use default mutators
        mutators: {
          import: function (newState) {
            return state = state.mergeDeep(Immutable.fromJS(newState));
          },
          set: function (path, value) {
            state = state.setIn(path, Immutable.fromJS(value));
          },
          unset: function (path, keys) {
            if (keys) {
              keys.forEach(function (key) {
                state = state.deleteIn(path.concat(key));
              });
            } else {
              state = state.deleteIn(path);
            }

          },
          push: function (path, value) {
            state = state.updateIn(path, function (array) {
              return array.push(Immutable.fromJS(value));
            });
          },
          splice: function () {
            var args = [].slice.call(arguments);
            var path = args.shift();
            state = state.updateIn(path, function (array) {
              return array.splice.apply(array, args.map(Immutable.fromJS.bind(Immutable)));
            });
          },
          merge: function (path, value) {
            state = state.mergeIn(path, Immutable.fromJS(value));
          },
          concat: function () {
            var args = [].slice.call(arguments);
            var path = args.shift();
            state = state.updateIn(path, function (array) {
              return array.concat.apply(array, args.map(Immutable.fromJS.bind(Immutable)));
            });
          },
          pop: function (path) {
            state = state.updateIn(path, function (array) {
              return array.pop();
            });
          },
          shift: function (path) {
            state = state.updateIn(path, function (array) {
              return array.shift();
            });
          },
          unshift: function (path, value) {
            var args = [].slice.call(arguments);
            var path = args.shift();
            state = state.updateIn(path, function (array) {
              return array.unshift.apply(array, args.map(Immutable.fromJS.bind(Immutable)));
            });
          }
        }
    };

  };

  return model;

};

module.exports = Model;
