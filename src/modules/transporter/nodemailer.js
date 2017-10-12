'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var nodemailer  = require('nodemailer');
var Q           = require('q');
var joi         = require('joi');
var util        = require('util');

/**
 * Default mandrill transporter to process mandrill request
 *
 * @param {Object} logger default logger to use on current instance
 */
function NodemailerTransporter (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
  /**
   * Internal transport
   */
  this.transport = {};
}

/**
 * Check if nodemailer instance is ready before any request
 *
 * @return {Promise} promise to catch
 */
NodemailerTransporter.prototype.isReady = function () {
  // Create deferred process
  var deferred = Q.defer();

  // Default verify process
  this.transport.verify(function (error, success) {
    // Has an error ?
    if (error) {
      // Reject
      return deferred.reject(error);
    }

    // On the other case we resolve the promise
    return deferred.resolve(success);
  });

  // Default statement
  return deferred.promise;
};

/**
 * Default method to send transactional email
 *
 * @param {Object} message message to send
 * @return {Promise} promise to catch
 */
NodemailerTransporter.prototype.send = function (message) {
  // Create deferred process
  var deferred = Q.defer();

  // Default send method
  this.transport.sendMail(message, function (error, success) {
    // Has an error ?
    if (error) {
      // Reject
      return deferred.reject(error);
    }

    // On the other case we resolve the promise
    return deferred.resolve(success);
  });

  // Default statement
  return deferred.promise;
};

/**
 * Create generic transporter for NodeMailer
 *
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
NodemailerTransporter.prototype.create = function (options) {

  // Default validation schema
  var schema = joi.object().required().keys({
    auth : joi.object().optional().keys({
      pass : joi.string().required().empty(),
      user : joi.string().required().empty()
    }),
    host            : joi.string().required().empty(),
    port            : joi.number().required().min(0),
    secure          : joi.boolean().optional().default(false),
    streamTransport : joi.boolean().optional().default(false)
  });

  // Try to validate current schema
  var result = joi.validate(options || {}, schema);

  // Has error ?
  if (_.isNull(result.error)) {
    // Set transport
    this.transport = nodemailer.createTransport(result.value);

    // Now return current instance
    return this;
  }

  // Log error
  this.logger.error([ '[ NodemailerTransporter.create ] - Cannot create transport for nodemailer.',
    'Error is :', result.error ].join(' '));

  // Return the error
  return false;
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Factory class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ NodemailerTransporter.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new NodemailerTransporter(l);
};
