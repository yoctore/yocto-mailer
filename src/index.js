'use strict';

var logger  = require('yocto-logger');
var Message = require('./modules/message');
var _       = require('lodash');

/**
 * A little factory to create a new message to send
 *
 * @param {Object} logger current logger instance
 */
function FMessage (logger) {
  /**
   * Internal logger
   */
  this.logger = logger;

  /**
   * Internal method to create a new message object
   *
   * @return {Object} a new instance of message object
   */
  this.new = function () {
    // Default statement
    return new Message(this.logger);
  }.bind(this);
}

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main message class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ FMessage.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new FMessage(l);
};
