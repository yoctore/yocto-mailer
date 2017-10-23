'use strict';

var fs      = require('fs');
var path    = require('path');
var moment  = require('moment');
var utils   = require('yocto-utils');
var _       = require('lodash');

/**
 * Default logger class
 *
 * @param {Object} logger current logger instance
 */
function Debugger (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * Save given content to a file
 *
 * @param {Mixed} message content to save
 * @return {Mixed} return of write action
 */
Debugger.prototype.saveToFile = function (message) {
  // Default statement
  return fs.writeFileSync(path.resolve([ process.cwd(), 'debug', [
    moment().format('YYYYMMDD-hhmm'), 'json' ].join('.')
  ].join('/')), message);
};

/**
 * Log given content a full debug details
 *
 * @param {String} prefix a custom string to append before print
 * @param {Mixed} message content to save
 * @param {Boolean} toFile if true save it to a file
 * @return {Mixed} return of write action
 */
Debugger.prototype.log = function (prefix, message, toFile) {
  // Not for a file ?
  if (!toFile) {
    return this.logger.debug([ prefix, utils.obj.inspect(message) ].join(' '));
  }

  // Default statement
  return this.saveToFile(JSON.stringify(message, null, 2));
};

/**
 * Default wrapper
 *
 * @param {String} prefix a custom string to append before print
 * @param {Mixed} message content to save
 * @return {Mixed} return of write action
 */
Debugger.prototype.debug = function (prefix, message) {
  // Default statement
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
