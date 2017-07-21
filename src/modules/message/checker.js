'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var fs          = require('fs');

/**
 * Process some verification test
 *
 * @param {Object} logger default logger to use on current instance
 */
function Checker (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * Check if current path if a file and if exits
 *
 * @param {String} value current path to use on current process
 * @return {Boolean} true if case of success, false otherwise
 */
Checker.prototype.isFile = function (value) {
  // do it in try catch
  try {
    // try to get stats value
    var stats = fs.statSync(value);

    // default valid statement
    return stats.isFile();
  } catch (e) {
    // log error
    this.logger.error([ '[ Checker.isFile ] - given path not exits :', e ].join(' '));
  }

  // default statement
  return false;
};

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ Checker.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Checker)(l);
};
