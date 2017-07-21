'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');

/**
 * Process send request on correct message type
 *
 * @param {Object} logger default logger to use on current instance
 */
function Sender (logger) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Message save and ready to send
   */
  this.message = {};

  /**
   * Constant to use for sender
   */
  this.NODEMAILER_TYPE = 'nodemailer'; // For nodemailer process
  this.MANDRILL_TYPE   = 'mandrill'; // For mandrill process

  /**
   * Default type of mailer module
   */
  this.type = this.NODEMAILER_TYPE;
}

/**
 * Store current message before sending.
 */
Sender.prototype.store = function (message, type) {
  // store current message
  this.message = message;
  // freeze object
  Object.freeze(this.message);
  // store current type of message
  this.type    = type;
  // default statement
  return this;
};

/**
 * Return current object for printing or anything else, only for utility case
 *
 * @return {Object} current message representation
 */
Sender.prototype.toObject = function () {
  // default statement
  return this.message;
};

/*
Sender.prototype.createTransport = function (options) {

}*/

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ Sender.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Sender)(l);
};
