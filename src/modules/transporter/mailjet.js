'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var mailjet     = require('node-mailjet');
var Q           = require('q');
var joi         = require('joi');

/**
 * Default mailjet transporter to process mailjet request
 *
 * @param {Object} logger default logger to use on current instance
 */
function MailjetTransporter (logger) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Default state
   */
  this.state = false;

  /**
   * Default mailjet instance
   */
  this.mailjet = {};

  /**
   * Default maijet api version
   */
  this.version = 'v3.1';
}

/**
 * Check if mandrill instance is ready before any request
 *
 * @return {Promise} promise to catch
 */
MailjetTransporter.prototype.isReady = function () {
  // Create deferred process
  var deferred = Q.defer();

  // Default verify process
  if (!_.isEmpty(this.mailjet)) {
    // On the other case we resolve the promise
    deferred.resolve();
  } else {
    // Reject in this case
    deferred.reject();
  }

  // Default statement
  return deferred.promise;
};

/**
 * Default method to send transactional email
 *
 * @param {Object} message message to send
 * @return {Promise} promise to catch
 */
MailjetTransporter.prototype.send = function (message) {
  // Create deferred process
  var deferred = Q.defer();
  // Default send method
  mailjet.post('send', {
    version : this.version
  })
    .request(message)
    .then(function (success) {
    // On the other case we resolve the promise
      return deferred.resolve(success);
    }).catch(function (error) {
    // Reject in this case
      return deferred.reject(error);
    });

  // Default statement
  return deferred.promise;
};

/**
 * Create generic transporter for mailjet
 *
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
MailjetTransporter.prototype.create = function (options) {
  // Setup mailjet with api public api key and secret api key
  mailjet = mailjet.connect(options.MJ_APIKEY_PUBLIC || process.env.MJ_APIKEY_PUBLIC,
    options.MJ_APIKEY_PRIVATE || process.env.MJ_APIKEY_PRIVATE);

  // Defined default schema
  var schema = joi.object().required().keys({
    apiKey    : joi.string().required().empty(),
    apiSecret : joi.string().required().empty()
  }).unknown();

  // Try to validate current schema
  var result = joi.validate(mailjet, schema);

  // Has error ?
  if (_.isNull(result.error)) {
    // Change state condition for isReady process
    this.mailjet = result.value;

    // Now return current instance
    return this;
  }

  // Log error
  this.logger.error([ '[ MailjetTransporter.createTransport ] - Cannot create transport for mailjet.',
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
    logger.warning('[ MailjetTransporter.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new MailjetTransporter(l);
};
