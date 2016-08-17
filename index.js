var Immutable = require('immutable');
var helpers = require('./immutable-helpers.js');
var toImmutable = helpers.toImmutable;
var toJS = helpers.toJS;


var Model = function (initialState) {

  var state = toImmutable(initialState);
  var trackPathChanges = [];

  // converts 'path.to.prop' or ['path.to.prop'] => ['path', 'to', 'prop'] for immutableJS
  function splitPath(path) {
    return path[0] ? path[0].split('.') : []
  }

  // Track converts 'path.to.prop' => ['path', 'to', 'prop'] for immutableJS
  function convertPath(path) {
    if (!path) return [];
    return Array.isArray(path) ? path : [path]
  }

  // Track converts 'path.to.prop' => ['path', 'to', 'prop'] for immutableJS
  function convertAndTrackPath(path) {
    // Let's make path a dot string for easier comparisons
    path = convertPath(path);

    var savePath = path.join('.');

    if (trackPathChanges.indexOf(savePath) === -1 && savePath !== '') {
      trackPathChanges.push(savePath);
    }
      
    return path;
  }

  // Wrap getIn() method to return undefined if array not passed 
  function get(path) {
    return state.getIn(convertAndTrackPath(path));
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
      var changedPaths = trackPathChanges
                          .map(path => path.split('.'))
                          .reduce(buildPathChanges, {});
      
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
            path = convertPath(path);
            return state.getIn(path);
          },
          toJS: function (path) {
            path = convertPath(path);
            return toJS(state.getIn(path));
          },
          export: function () {
            return toJS(state);
          },
          keys: function (path) {
            path = convertPath(path);
            return state.getIn(path).keySeq().toArray();
          },
          findWhere: function (path, predicate) {
            path = convertPath(path);
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
            return state = state.mergeDeep(toImmutable(newState));
          },
          set: function (path, value) {
            path = convertAndTrackPath(path);
            state = state.setIn(path, toImmutable(value));
          },
          unset: function (path, keys) {
            path = convertAndTrackPath(path);
            if (keys) {
              keys.forEach(function (key) {
                state = state.deleteIn(path.concat(key));
              });
            } else {
              state = state.deleteIn(path);
            }

          },
          push: function (path, value) {
            path = convertAndTrackPath(path);
            state = state.updateIn(path, function (array) {
              return array.push(toImmutable(value));
            });

          },
          splice: function () {
            var args = [].slice.call(arguments);
            var path = convertAndTrackPath(args.shift());
            state = state.updateIn(path, function (array) {
              return array.splice.apply(array, args.map(toImmutable.bind(Immutable)));
            });
          },
          merge: function (path, value) {
            path = convertAndTrackPath(path);
            state = state.mergeIn(path, toImmutable(value));
          },
          concat: function () {
            var args = [].slice.call(arguments);
            var path = convertAndTrackPath(args.shift());
            state = state.updateIn(path, function (array) {
              return array.concat.apply(array, args.map(toImmutable.bind(Immutable)));
            });
          },
          pop: function (path) {
            path = convertAndTrackPath(path);
            state = state.updateIn(path, function (array) {
              return array.pop();
            });
          },
          shift: function (path) {
            path = convertAndTrackPath(path);
            state = state.updateIn(path, function (array) {
              return array.shift();
            });
          },
          unshift: function (path, value) {
            var args = [].slice.call(arguments);
            var path = convertAndTrackPath(args.shift());
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
