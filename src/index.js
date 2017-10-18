'use strict';

var logger        = require('yocto-logger');
var Transactional = require('./modules/transactional');
var Marketing     = require('./modules/marketing');
var _             = require('lodash');

/**
 * A little factory to create a new message to send
 *
 * @param {Object} logger current logger instance
 */
function MailerTools (logger) {
  /**
   * Internal logger
   */
  this.logger = logger;

  /**
   * Internal method to create a new transactionnal message
   *
   * @return {Object} a new instance of message object
   */
  this.transactional = function (options) {
    // Default statement
    return new Transactional(this.logger, options);
  }.bind(this);

  /**
   * Internal method to create a marketing process
   */
  this.marketing = function (options) {
    // Default statement
    return new Marketing(this.logger, options);
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
    logger.warning('[ MailerTools.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new MailerTools(l);
};
