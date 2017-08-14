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
  // Do it in try catch
  try {
    // Try to get stats value
    var stats = fs.statSync(value);

    // Default valid statement
    return stats.isFile();
  } catch (e) {
    // Log error
    this.logger.error([ '[ Checker.isFile ] - given path not exits :', e ].join(' '));
  }

  // Default statement
  return false;
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Checker class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Checker.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Checker(l);
};
