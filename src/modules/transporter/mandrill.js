'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var mandrill    = require('mandrill-api/mandrill');
var Q           = require('q');
var joi         = require('joi');

/**
 * Default mandrill transporter to process mandrill request
 *
 * @param {Object} logger default logger to use on current instance
 */
function MandrillTransporter (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * Check if mandrill instance is ready before any request
 *
 * @return {Promise} promise to catch
 */
MandrillTransporter.prototype.isReady = function () {
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
};

/**
 * Default method to send transactional email
 *
 * @param {Object} message message to send
 * @return {Promise} promise to catch
 */
MandrillTransporter.prototype.send = function (message) {
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
};

/**
 * Create generic transporter for NodeMailer
 *
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
MandrillTransporter.prototype.create = function (options) {
  // Default schema for mandrill
  var schema = joi.string().required().empty();

  // Try to validate current schema
  var result = joi.validate(options || {}, schema);

  // Has error ?
  if (_.isNull(result.error)) {
    // Default schema for mandrill
    var transport = new mandrill.Mandrill(result.value);

    // Extend this with transport instance
    _.extend(this, transport);

    // Now return current instance
    return this;
  }

  // Log error
  this.logger.error([ '[ MandrillTransporter.createTransport ] - Cannot create transport for mandrill.',
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
    logger.warning('[ MandrillTransporter.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new MandrillTransporter(l);
};
