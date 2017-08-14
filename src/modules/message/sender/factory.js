'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var nodemailer  = require('nodemailer');
var mandrill    = require('mandrill-api/mandrill');
var Q           = require('q');
var joi         = require('joi');

/**
 * Create a valid and generic transporter from given options
 *
 * @param {Object} logger default logger to use on current instance
 */
function SenderFactory (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * Create generic transporter for NodeMailer
 *
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
SenderFactory.prototype.createMandrillTransporter = function (options) {
  // Default schema for mandrill
  var schema = joi.string().required().empty();

  // Try to validate current schema
  var result = joi.validate(options || {}, schema);

  // Has error ?
  if (_.isNull(result.error)) {
    // Default schema for mandrill
    var transport = new mandrill.Mandrill(result.value);

    // Normalize an isReady function
    transport.isReady = function () {
      // Create deferred process
      var deferred = Q.defer();

      // Default verify process
      this.users.ping({}, function (success) {
        // On the other case we resolve the promise
        return deferred.resolve(success);
      }, function (error) {
        // Reject in this case
        return deferred.reject(error);
      });

      // Default statement
      return deferred.promise;
    }.bind(transport);

    // Normalize an send function
    transport.send = function (message) {
      // Create deferred process
      var deferred = Q.defer();

      // Default send method
      this.messages.send({
        message : message
      }, function (success) {
        // On the other case we resolve the promise
        return deferred.resolve(success);
      }, function (error) {
        // Reject in this case
        return deferred.reject(error);
      });

      // Default statement
      return deferred.promise;
    }.bind(transport);

    // Default statement
    return transport;
  }

  // Log error
  this.logger.error([ '[ Sender.createTransport ] - Cannot create transport for mandrill.',
    'Error is :', result.error ].join(' '));

  // Return the error
  return false;
};

/**
 * Create generic transporter for NodeMailer
 *
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
SenderFactory.prototype.createNodeMailerTransporter = function (options) {
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
    var transport = nodemailer.createTransport(result.value);

    // Normalize an isReady function
    transport.isReady = function () {
      // Create deferred process
      var deferred = Q.defer();

      // Default verify process
      this.verify(function (error, success) {
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
    }.bind(transport);

    // Normalize an send function
    transport.send = function (message) {
      // Create deferred process
      var deferred = Q.defer();

      // Default send method
      this.sendMail(message, function (error, success) {
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
    }.bind(transport);

    // Default statement
    return transport;
  }

  // Log error
  this.logger.error([ '[ Sender.createTransport ] - Cannot create transport for nodemailer.',
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
    logger.warning('[ SenderFactory.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new SenderFactory(l);
};
