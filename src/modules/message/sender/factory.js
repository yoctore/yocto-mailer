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
  // default schema for mandrill
  var schema = joi.string().required().empty();

  // try to validate current schema
  var result = joi.validate(options || {}, schema);

  // has error ?
  if (_.isNull(result.error)) {
    // default schema for mandrill
    var transport = new mandrill.Mandrill(result.value);

    // normalize an isReady function
    transport.isReady = function () {
      // create deferred process
      var deferred = Q.defer();

      // default verify process
      this.users.ping({}, function (success) {
        // on the other case we resolve the promise
        return deferred.resolve(success);
      }, function (error) {
        // reject in this case
        return deferred.reject(error);
      });

      // default statement
      return deferred.promise;
    }.bind(transport);

    // normalize an send function
    transport.send = function (message) {
      // create deferred process
      var deferred = Q.defer();

      // default send method
      this.messages.send({ message : message }, function (success) {
        // on the other case we resolve the promise
        return deferred.resolve(success);
      }, function (error) {
        // reject in this case
        return deferred.reject(error);
      });

      // default statement
      return deferred.promise;
    }.bind(transport);

    // default statement
    return transport;
  }
  // log error
  this.logger.error([ '[ Sender.createTransport ] - Cannot create transport for mandrill.',
    'Error is :', result.error ].join(' '));
  // return the error
  return false;
};

/**
 * Create generic transporter for NodeMailer
 *
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
SenderFactory.prototype.createNodeMailerTransporter = function (options) {
  // default validation schema
  var schema = joi.object().required().keys({
    host            : joi.string().required().empty(),
    port            : joi.number().required().min(0),
    secure          : joi.boolean().optional().default(false),
    auth            : joi.object().optional().keys({
      user : joi.string().required().empty(),
      pass : joi.string().required().empty()
    }),
    streamTransport : joi.boolean().optional().default(false)
  });

  // try to validate current schema
  var result = joi.validate(options || {}, schema);

  // has error ?
  if (_.isNull(result.error)) {
    // set transport
    var transport = nodemailer.createTransport(result.value);

    // normalize an isReady function
    transport.isReady = function () {
      // create deferred process
      var deferred = Q.defer();

      // default verify process
      this.verify(function (error, success) {
        // has an error ?
        if (error) {
          // reject
          return deferred.reject(error);
        }

        // on the other case we resolve the promise
        return deferred.resolve(success);
      });

      // default statement
      return deferred.promise;
    }.bind(transport);

    // normalize an send function
    transport.send = function (message) {
      // create deferred process
      var deferred = Q.defer();

      // default send method
      this.sendMail(message, function (error, success) {
        // has an error ?
        if (error) {
          // reject
          return deferred.reject(error);
        }
        // on the other case we resolve the promise
        return deferred.resolve(success);
      });

      // default statement
      return deferred.promise;
    }.bind(transport);

    // default statement
    return transport;
  }
  // log error
  this.logger.error([ '[ Sender.createTransport ] - Cannot create transport for nodemailer.',
    'Error is :', result.error ].join(' '));
  // return the error
  return false;
};

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ SenderFactory.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (SenderFactory)(l);
};
