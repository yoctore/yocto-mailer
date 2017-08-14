'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var Q           = require('q');
var factory     = require('./factory');

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

  // For nodemailer process
  this.NODEMAILER_TYPE = 'nodemailer';

  // For mandrill process
  this.MANDRILL_TYPE = 'mandrill';

  /**
   * Default type of mailer module
   */
  this.type = this.NODEMAILER_TYPE;

  /**
   * Constant for state list
   */

  // Send is waiting for sending
  this.STATE_PENDING = 'pending';

  // Sender successfuly send the message
  this.STATE_SUCCESS = 'success';

  // Sender is on error
  this.STATE_ERROR = 'error';

  // Sender is ready
  this.STATE_READY = 'ready';

  /**
   * Current state object
   */
  this.state = {
    code    : 'pending',
    message : null
  };

  /**
   * Internal factory to build correct transporter
   */
  this.factory = factory(this.logger);
}

/**
 * Store current message before sending.
 *
 * @param {String} message object message to save before sent
 * @param {String} type current message type to sending process
 * @return {Object} current instance
 */
Sender.prototype.store = function (message, type) {
  // Store current message
  this.message = message;

  // Freeze object
  Object.freeze(this.message);

  // Store current type of message
  this.type = type;

  // Default statement
  return this;
};

/**
 * Return current object for printing or anything else, only for utility case
 *
 * @return {Object} current message representation
 */
Sender.prototype.toObject = function () {
  // Default statement
  return this.message;
};

/**
 * Update current state with given value
 *
 * @param {String} code state code to set
 * @param {String} message state message to set
 * @return {Boolean} true in case of success false otherwise
 */
Sender.prototype.updateState = function (code, message) {
  // Set code
  this.state.code = code || this.STATE_PENDING;

  // Set message
  this.state.message = message || null;

  // Default statement
  return _.has(this.state, 'code') && _.has(this.state, 'message') &&
    this.state.code === code && this.state.message === message;
};

/**
 * Create a valid transport for current message before sending
 *
 * @param {Object} options given options used for creation
 * @return {Sender} current sender instance
 */
Sender.prototype.createTransport = function (options) {
  // Current transport
  var transport = false;

  // Is nodemailer ?
  if (this.type === this.NODEMAILER_TYPE) {
    // Set transport
    transport = this.factory.createNodeMailerTransporter(options);
  }

  // Is mandrill ?
  if (this.type === this.MANDRILL_TYPE) {
    // Set transport
    transport = this.factory.createMandrillTransporter(options);
  }

  // Set state
  this.updateState(transport ?
    this.STATE_READY : this.STATE_ERROR,
  transport ? 'Transport is ready' : 'Cannot create transport');

  // Update state
  this.updateState(transport ? this.STATE_READY : this.STATE_ERROR,
    transport ? 'Transport is ready' : 'Cannot create transport');

  // Default statement
  return transport;
};

/**
 * Update current message status and append stats on given response
 *
 * @param {Integer} start process.hrtime value to use for ending time
 * @param {Object} response default response to use on default statement
 * @param {String} status status to use to update current message
 * @return {Object} end object to use an store on response
 */
Sender.prototype.updateAndBuildStats = function (start, response, status) {
  // Get end time value to show execution time
  var end = process.hrtime(start);

  // Log debug messsage
  this.logger.debug([ '[ Sender.send ] - sending email was take :',
    end[0], 'secondes and', end[1] / 1000000, 'milliseconds'
  ].join(' '));

  // Update current state
  this.updateState(status);

  // Default statement
  return {
    response : response,
    stats    : {
      milliseconds : end[1],
      seconds      : end[0]
    }
  };
};

/**
 * Send current message with given options
 *
 * @param {Object|String} options options to use for current message
 * @return {Promise} promise to catch
 */
Sender.prototype.send = function (options) {
  // Create deferred process
  var deferred = Q.defer();

  // Define here time when process start
  var start = process.hrtime();

  // Message is invalid ?

  if (_.isEmpty(this.message)) {
    // Invalid statement
    deferred.reject('Message in empty. Build your messsage before send.');
  } else {
    // Sender is valid ?
    var transport = this.createTransport(options);

    // Transport is ready ?
    if (this.state.code === this.STATE_READY) {
      // Try to send message
      transport.isReady().then(function () {
        // Do a debug message
        this.logger.debug([ '[ Sender.send ] -', this.type, 'Connector is ready' ].join(' '));

        // If we are here we need to send the message
        transport.send(this.message).then(function (success) {
          // Update state and get new success object
          success = this.updateAndBuildStats(start, success, this.STATE_SUCCESS);

          // On the other case we resolve the promise
          return deferred.resolve(success);
        }.bind(this)).catch(function (error) {
          // Update state and get new success object
          error = this.updateAndBuildStats(start, success, this.STATE_ERROR);

          // Reject with error
          deferred.reject(error);
        }.bind(this));
      }.bind(this)).catch(function (error) {
        // Reject with error
        deferred.reject(error);
      });
    } else {
      // Reject too ..
      deferred.reject([ 'Transport is on an invalid state. state must be on',
        this.STATE_READY, 'state before sending' ].join(' '));
    }
  }

  // Default statement
  return deferred.promise;
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
    logger.warning('[ Sender.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Sender(l);
};
