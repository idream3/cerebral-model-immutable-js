var Immutable = require('immutable');
var { toImmutable, toJS } = require('immutable-helpers');

var Model = function (initialState) {

  var state = toImmutable(initialState);
  var trackPathChanges = [];

  // Wrap getIn() method to return undefined if array not passed 
  function get(path) {
    path = (Array.isArray(path) && path[0]) ? path[0].split('.') : []
    return state.getIn(path);
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
      state = toImmutable(initialState);
    });

    controller.on('seek', function (seek, recording) {
      recording.initialState.forEach(function (stateUpdate) {
        state = state.setIn(stateUpdate.path, toImmutable(stateUpdate.value));
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
          return toJS(state);
        },
        accessors: {
          get: function (path) {
            return get(path);
          },
          toJS: function (path) {
            return toJS(get(path));
          },
          export: function () {
            return toJS(state);
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
            return state = state.mergeDeep(toImmutable(newState));
          },
          set: function (path, value) {
            trackPathChanges.push(path);
            isImmutable
            state = state.setIn(path, toImmutable(value));
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
              return array.push(toImmutable(value));
            });

          },
          splice: function () {
            var args = [].slice.call(arguments);
            var path = args.shift();
            state = state.updateIn(path, function (array) {
              return array.splice.apply(array, args.map(toImmutable.bind(Immutable)));
            });
          },
          merge: function (path, value) {
            trackPathChanges.push(path);
            state = state.mergeIn(path, toImmutable(value));
          },
          concat: function () {
            var args = [].slice.call(arguments);
            var path = args.shift();
            state = state.updateIn(path, function (array) {
              return array.concat.apply(array, args.map(toImmutable.bind(Immutable)));
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
              return array.unshift.apply(array, args.map(toImmutable.bind(Immutable)));
            });
          }
        }
    };

  };

  return model;

};

module.exports = Model;
