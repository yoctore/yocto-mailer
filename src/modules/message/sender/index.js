'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var Q           = require('q');

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
  this.NODEMAILER_TYPE  = 'nodemailer'; // For nodemailer process
  this.MANDRILL_TYPE    = 'mandrill'; // For mandrill process

  /**
   * Default type of mailer module
   */
  this.type = this.NODEMAILER_TYPE;

  /**
   * Constant for state list
   */
  this.STATE_PENDING = 'pending'; // send is waiting for sending
  this.STATE_SUCCESS = 'success'; // sender successfuly send the message
  this.STATE_ERROR   = 'error'; // sender is on error
  this.STATE_READY   = 'ready'; // sender is ready

  /**
   * Current state object
   */
  this.state = {
    code      : 'pending',
    message   : null
  };

  /**
   * Internal factory to build correct transporter
   */
  this.factory = require('./factory')(this.logger);
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

/**
 * Update current state with given value
 *
 * @param {String} code state code to set
 * @param {String} message state message to set
 * @return {Boolean} true in case of success false otherwise
 */
Sender.prototype.updateState = function (code, message) {
  // set code
  this.state.code = code || this.STATE_PENDING;
  // set message
  this.state.message = message || null;

  // default statement
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
  // current transport
  var transport = false;

  // is nodemailer ?
  if (this.type === this.NODEMAILER_TYPE) {
    // set transport
    transport = this.factory.createNodeMailerTransporter(options);
  }

  // is mandrill ?
  if (this.type === this.MANDRILL_TYPE) {
    // set transport
    transport = this.factory.createMandrillTransporter(options);
  }

  // set state
  this.updateState(transport ?
    this.STATE_READY : this.STATE_ERROR,
      transport ? 'Transport is ready' : 'Cannot create transport');
  // Update state
  this.updateState(transport ? this.STATE_READY : this.STATE_ERROR,
    transport ? 'Transport is ready' : 'Cannot create transport');

  // default statement
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
  // get end time value to show execution time
  var end = process.hrtime(start);

  // log debug messsage
  this.logger.debug([ '[ Sender.send ] - sending email was take :',
      end[0], 'secondes and', (end[1] / 1000000), 'milliseconds'
  ].join(' '));

  // update current state
  this.updateState(status);

  // default statement
  return {
    response  : response,
    stats     : {
      seconds       : end[0],
      milliseconds  : end[1]
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
  // create deferred process
  var deferred = Q.defer();
  // define here time when process start
  var start = process.hrtime();
  // message is invalid ?
  if (_.isEmpty(this.message)) {
    // invalid statement
    deferred.reject('Message in empty. Build your messsage before send.');
  } else {
    // sender is valid ?
    var transport = this.createTransport(options);

    // transport is ready ?
    if (this.state.code === this.STATE_READY) {
      // try to send message
      transport.isReady().then(function () {
        // do a debug message
        this.logger.debug([ '[ Sender.send ] -', this.type, 'Connector is ready' ].join(' '));
        // if we are here we need to send the message
        transport.send(this.message).then(function (success) {
          // get end time value to show execution time
          var end = process.hrtime(start);

          // Update state and get new success object
         success = this.updateAndBuildStats(start, success, this.STATE_SUCCESS);

          // on the other case we resolve the promise
          return deferred.resolve(success);
        }.bind(this)).catch(function (error) {

          // Update state and get new success object
          error = this.updateAndBuildStats(start, success, this.STATE_ERROR);

          // reject with error
          deferred.reject(error);
        }.bind(this));
      }.bind(this)).catch(function (error) {
        // reject with error
        deferred.reject(error);
      });
    } else {
      // reject too ..
      deferred.reject([ 'Transport is on an invalid state. state must be on',
        this.STATE_READY, 'state before sending' ].join(' '));
    }
  }

  // default statement
  return deferred.promise;
};

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
