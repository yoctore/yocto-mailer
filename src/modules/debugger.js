'use strict';

var fs      = require('fs');
var path    = require('path');
var moment  = require('moment');
var utils   = require('yocto-utils');
var _       = require('lodash');

/**
 * Default logger class
 */
function Debugger(logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * Save given content to a file
 *
 * @param {Mixed} message content to save
 */
Debugger.prototype.saveToFile = function (message) {
  fs.writeFileSync(path.resolve([ process.cwd(), 'debug', [ moment().format('YYYYMMDD-hhmm'), 'json' ].join('.') ].join('/')), message);
};

/**
 * Log given content a full debug details
 *
 * @param {String} prefix a custom string to append before print
 * @param {Mixed} message content to save
 * @param {Boolean} if true save it to a file
 */
Debugger.prototype.log = function (prefix, message, toFile) {
  // not for a file ?
  if (!toFile) {
    return this.logger.debug([ prefix, utils.obj.inspect(message) ].join(' '));
  }

  // default statement
  return this.saveToFile(JSON.stringify(message, null, 2));
};
/**
 * Default wrapper
 *
 * @param {String} prefix a custom string to append before print
 * @param {Mixed} message content to save
 */
Debugger.prototype.debug = function (prefix, message) {
  // default statement
  return this.log(prefix, message, process.env.DEBUG_TO_FILE || false);
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Sender class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Debugger.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Debugger(l);
};