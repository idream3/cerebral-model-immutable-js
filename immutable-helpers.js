var Immutable = require('immutable');

/**
 * Checks if the passed in value is of type Object
 * @param {*} val
 * @return {boolean}
 */
var isObject = function(obj) {
  var type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}


/**
 * A collection of helpers for the ImmutableJS library
 */

/**
 * @param {*} obj
 * @return {boolean}
 */
var isImmutable = function(obj) {
  return Immutable.Iterable.isIterable(obj)
}

/**
 * Returns true if the value is an ImmutableJS data structure
 * or a JavaScript primitive that is immutable (string, number, etc)
 * @param {*} obj
 * @return {boolean}
 */
var isImmutableValue = function(obj) {
  return (
    isImmutable(obj) ||
    !isObject(obj)
  )
}

/**
 * Converts an Immutable Sequence to JS object
 * Can be called on any type
 */
exports.toJS = function(arg) {
  // arg instanceof Immutable.Sequence is unreliable
  return (isImmutable(arg))
    ? arg.toJS()
    : arg
}

/**
 * Converts a JS object to an Immutable object, if it's
 * already Immutable its a no-op
 */
exports.toImmutable = function(arg) {
  return (isImmutableValue(arg))
    ? arg
    : Immutable.fromJS(arg)
}