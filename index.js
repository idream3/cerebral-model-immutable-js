var Immutable = require('immutable');
var deepmerge = require('deepmerge');

var Model = function (initialState) {

  var model = function (controller) {

    controller.on('reset', function () {
      // Reset to initial state
    });

    controller.on('seek', function (seek, isPlaying, recording) {
      // Get recording initial state from: recording.initialState
      // Then reset the state to that
    });

    return {
        get: function (path) {

        },
        export: function () {
          // Plain JS export of store
        },
        import: function (newState) {
          // Use deepmerge to merge in changes
        },

        // Use default mutators
        mutators: {
          set: function (path, value) {

          },
          unset: function (path) {

          },
          push: function (path, value) {

          },
          splice: function () {

          },
          merge: function (path, value) {

          },
          concat: function () {

          },
          pop: function (path) {

          },
          shift: function (path) {

          },
          unshift: function (path, value) {

          }
        }
    };

  };

  return model;

};

module.exports = Model;
