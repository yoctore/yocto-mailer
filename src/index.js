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
   */
  this.new = function () {
    // default statement
    return new Message(this.logger);
  }.bind(this);
}

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ FMessage.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (FMessage)(l);
};
