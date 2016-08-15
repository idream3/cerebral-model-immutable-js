var Immutable = require('immutable');


var Model = function (initialState) {

  var state = Immutable.fromJS(initialState);
  var trackPathChanges = [];

  function get(path) {
    return Array.isArray(path) ? state.getIn(path) : undefined;
  }

  /**
   * Builds a nested object from array of string paths
   */
  function buildPathChanges(changes, path) {
    path.reduce(function (changes, key, index) {
      if (index === path.length - 1 && !changes[key]) {
        changes[key] = true
      } else if (changes[key] === true) {
        changes[key] = {}
      } else if (!changes[key]) {
        changes[key] = {}
      }

      return changes[key];
    }, changes);
    return changes;
  }

  var model = function (controller) {

    controller.on('reset', function () {
      state = Immutable.fromJS(initialState);
    });

    controller.on('seek', function (seek, recording) {
      recording.initialState.forEach(function (stateUpdate) {
        state = state.setIn(stateUpdate.path, Immutable.fromJS(stateUpdate.value));
      });
    });

    controller.on('modulesLoaded', function () {
      initialState = state.toJSON();
    })

    controller.on('change', function () {
      var changedPaths = trackPathChanges.reduce(buildPathChanges, {});
      
      // Tell Cerebral to update the changed paths
      controller.emit('flush', changedPaths);

      // Reset the path tracking for next the round of updates
      trackPathChanges = [];
    });

    return {
        logModel: function () {
          return state.toJS();
        },
        accessors: {
          get: function (path) {
            return get(path);
          },
          toJS: function (path) {
            return get(path).toJS();
          },
          export: function () {
            return state.toJS();
          },
          keys: function (path) {
            return get(path).keySeq().toArray();
          },
          findWhere: function (path, predicate) {
            var keysCount = Object.keys(predicate).length;
            return get(path).find(function (item) {
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
            trackPathChanges.push(path);
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
            trackPathChanges.push(path);
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
