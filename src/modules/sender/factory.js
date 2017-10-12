'use strict';

var logger              = require('yocto-logger');
var _                   = require('lodash');
var nodemailerTransport = require('../transporter/nodemailer');
var mandrillTransport   = require('../transporter/mandrill');
var mailjetTransport    = require('../transporter/mailjet');
var mailchimpTransport  = require('../transporter/mailchimp');

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

  /**
   * We define here all available provider / services
   */
  this.NODEMAILER_TYPE  = 'nodemailer';
  this.MANDRILL_TYPE    = 'mandrill';
  this.MAILJET_TYPE     = 'mailjet';
  this.MAILCHIMP_TYPE   = 'mailchimp';

  /**
   * Default list of transport to use for mapping
   */
  this.lists = [
    {
      instance : nodemailerTransport(this.logger),
      type     : this.NODEMAILER_TYPE
    },
    {
      instance : mandrillTransport(this.logger),
      type     : this.MANDRILL_TYPE
    },
    {
      instance : mailjetTransport(this.logger),
      type     : this.MAILJET_TYPE
    },
    {
      instance : mailchimpTransport,
      type     : this.MAILCHIMP_TYPE
    }
  ];
}

/**
 * Generic method to create transporter
 *
 * @param {String} type current type to use to retreive correct instance to use 
 * @param {Object} options current options to use for new transporter
 * @return {Boolean|Object} generic transport instance to use for sending
 */
SenderFactory.prototype.createTransporter = function (type, options) {
  // Try to get default defintion of transport
  var transport = _.find(this.lists, function (o) {
    return o.type === type
  });

  // Default statement
  return transport.instance.create(options) || false;
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
