'use strict';

var mandrillapi = require('mandrill-api/mandrill');
var _           = require('lodash');
var striptags   = require('striptags');
var joi         = require('joi');
var Promise     = require('promise');
var utils       = require('yocto-utils');

/**
 * Yocto Mandrill module wrapper
 *
 * This module manage your own mandrill mailer api
 *
 * @date : 11/09/2015
 * @author : Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module Mailer
 * @class Mandrill
 */
function Mandrill (logger) {

  /**
   * The mandrill client for sending mail
   *
   * @property {Object} client
   * @default empty
   */
  this.client = {};

  /**
   * default configution object that contains all mail options
   *
   * @property {Object} options
   * @default {
   *    fromName      : '',
   *    fromEmail     : '',
   *    to            : '',
   *    subject       : '',
   *    html          : '',
   *    text          : ''
   * }
   */
  this.options = {
    fromName    : '', // from name to send on mail
    fromEmail   : '', // sender address
    to          : [], // list of receivers
    subject     : '', // Subject line
    html        : '', // html text
    text        : '', // text value,
    headers     : {}  // default header to send  
  };

  /**
   * Clone the options and omit parameter 'from_email'
   * It used on clean method after sending an email
   *
   * @property {Object} defaultOption
   * @default {
   *    to            : '',
   *    subject       : '',
   *    html          : '',
   *    text          : ''
   */
  this.defaultOption = _.omit(_.clone(this.options), [ 'from_email', 'from_name' ]);

  /**
   * Default logger instance
   *
   * @property {Object} logger
   */
  this.logger = logger;
}

/**
 * Set the mandrill client apiKey to connect to mandrill service
 *
 * @method setConfig
 * @param {String} apiKey The apikey for mandrill service
 *
 * @example
 * <code>mailer.mandrill.setConfig('YOUR-KEY-HERE');</code>
 */
Mandrill.prototype.setConfig = function (apiKey) {
  // define client with current api key
  this.client = new mandrillapi.Mandrill(apiKey);

  // saved context
  var context = this;

  // message
  this.logger.debug('[ Mandrill.setConfig ] - Validating api key. Please wait ....');

  // return statement
  return new Promise(function (fulfill, reject) {
    // check api key state
    if (!_.isString(apiKey)) {
      var message = [ '[ Mandrill.setConfig ] -',
                      'Invalid apiKey given. The api key should be a string and',
                      (typeof apiKey), 'given'
                    ].join(' ');
      context.logger.error(message);
      // invalid statement
      reject(message);

    } else {
      context.client.users.ping2({}, function (response) {
        // key is correct process
        context.logger.info('[ Mandrill.setConfig ] - API Key is valid. Use it !');
        // call callback
        fulfill(response);
      } , function (error) {
        context.logger.error([ '[ Mandrill.setConfig ] -',
                               'Mandrill API key validation failed',
                               'Error is :',
                               error.message,
                               'with code :',
                               error.code,
                               'and code name :',
                               error.name
                             ].join(' '));

        // call callback
        reject(error);
      });
    }
  });
};

/**
 * Send the mail with all parameters (from_email, to, cc , bcc)
 * After the mail was send this paramater will be remove : to, cc, bcc, subject, message
 *
 * @method send
 * @param {String} subject Subject of the email
 * @param {String} message Html message to send
 */
Mandrill.prototype.send = function (subject, message) {
  // send mail with defined transport object
  this.logger.debug('[ Mandrill.send ] - Try sending a new email ...');

  // html value
  this.options.html     = _.isString(message) && !_.isEmpty(message) ? message : '';

  // check if html is empty before process text element
  if (!_.isEmpty(this.options.html)) {
    // text value
    this.options.text     = striptags(message);
  }

  // subject value
  this.options.subject  = _.isString(subject) ? subject : '';

  // save current context for promise
  var context = this;

  // default statement
  return new Promise(function (fulfill, reject) {
    // All is ready ?
    if (!context.isReady(true)) {
      // dispatch message
      context.logger.error('[ Mandrill.send ] - can\'t send mail, invalid configuration.');

      // reject
      reject('[ Mandrill.send ] - can\'t send mail, invalid configuration.');
    } else {
      // clone options for usage
      var coptions = _.clone(context.options);

      // Clean option for the next request
      context.logger.debug('[ Mandrill.send ] - Cleanning object before send request');
      context.clean();

      // is clean and ready to send ?
      if (!context.clean(false, true)) {
        context.logger.error([ '[ Mandrill.send ] - can\'t send email',
                               'option object is not properly clean' ].join(' '));
        // failed callback
        reject('[ Mandrill.send ] - can\'t send email option object is not properly clean');
      }

      // Rename key for mandrill api
      coptions = utils.obj.renameKey(coptions, 'fromName', 'from_name');
      coptions = utils.obj.renameKey(coptions, 'fromEmail', 'from_email');

      // log message
      context.logger.info('[ Mandrill.send ] - Sending a new email ...');
      // Send message to client
      context.client.messages.send({ 'message' : coptions, 'async' : false }, function (result) {
        // Success Callback
        fulfill(result);
      } , function (error) {
        // failed callback
        reject(error);
      });
    }
  });
};

/**
 * Set current expeditor
 *
 * @param {String} email current email to use for request
 * @param {String} name current name to use for request
 * @return {Boolean} return true on success, false otherwise
 */
Mandrill.prototype.setExpeditor = function (email, name) {
  // define default object for validation
  var data = { fromEmail  : email, fromName   : name };

  // define validation schema
  var schema = {
    fromEmail  : joi.string().email().required().trim(),
    fromName   : joi.string()
  };

  // validate
  var status = joi.validate(data, schema);

  // has error ?
  if (!_.isNull(status.error)) {
    // log message
    _.each(status.error.details, function (d) {
      this.logger.error([ '[ Mandrill.setExpeditor ] - Cannot set expeditor.',
                          'Error is :',
                          d.message
                        ].join(' '));
    }, this);

    // invalid statement
    return false;
  }

  // assign data
  _.merge(this.options, data);

  // default statement
  return true;
};

/**
 * Add a reply to current mailer
 *
 * @param {String} email current email to use for reply to
 * @return {Boolean} true if all is ok false otherwise
 */
Mandrill.prototype.addReplyTo = function (email) {
  // define default object for validation
  var data   = { "Reply-To" : email };

  // define schema
  var schema = {
    "Reply-To" : joi.string().email().required().trim()
  };
  
  // validate
  var status = joi.validate(data, schema);

  // has error ?
  if (!_.isNull(status.error)) {
    // log message
    _.each(status.error.details, function (d) {
      this.logger.error([ '[ Mandrill.addReplyTo ] - Cannot add a reply-to.',
                          'Error is :',
                          d.message
                        ].join(' '));
    }, this);

    // invalid statement
    return false;
  }

  // assign data
  _.merge(this.options.headers, data);

  // default statement
  return true;
}

/**
 * Default clean function for the next item
 *
 * @param {Boolean} all true for complete cleaning
 * @param {Boolean} onlyStatus true if we want only the current status of cleaning state
 * @return {Boolean} true if all is clean, false otherwise
 */
Mandrill.prototype.clean = function (all, onlyStatus) {

  // process these only is normal process is asked
  if (!_.isBoolean(onlyStatus) || (_.isBoolean(onlyStatus) && onlyStatus === false)) {
    // reset text element
    this.options.subject = this.options.html = this.options.text = '';
    // reset to items
    this.options.to      = [];

    // clean all config ?
    if (_.isBoolean(all) && all === true) {
      // re init with default value
      _.extend(this.options, this.defaultOption);
    }
  } else {
    // validate new schema again all must be ok after clean
    var schema = joi.object().keys({
      fromName    : joi.string().empty(''),
      fromEmail   : joi.string().email().required().trim(),
      to          : joi.array().length(0),
      subject     : joi.string().empty(''),
      html        : joi.string().empty(''),
      text        : joi.string().empty(''),
      headers     : joi.object().empty({})
    }).unknown();

    // validate the cleaning state
    var status = joi.validate(this.options, schema);

    // has error ?
    if (!_.isNull(status.error)) {
      // log message
      _.each(status.error.details, function (d) {
        this.logger.error([ '[ Mandrill.clean ] - Cannot clean current object.',
                               'Error is :',
                               d.message
                             ].join(' '));
      }, this);

      // invalid statement
      return false;
    }
  }

  // default statement
  return true;
};

/**
 * Add a new recipient on list
 *
 * @param {String} email current email to add into list
 * @param {String} name current email name to add into list
 * @param {String} type current email type to add into list (to, cc, bcc)
 * @return {Boolean} return true on success, false otherwise
 */
Mandrill.prototype.addRecipient = function (email, name, type) {
  // define validation schema
  var schema = joi.object().keys({
    email : joi.string().email().required().trim(),
    name  : joi.string(),
    type  : joi.string().default('to').allow('to', 'cc', 'bcc')
  });

  // define type rules
  var data = { email : email, name : name, type : type };

  // valid recipient
  var status = joi.validate(data, schema);

  // has error ?
  if (!_.isNull(status.error)) {
    // log message
    _.each(status.error.details, function (d) {
      this.logger.error([ '[ Mandrill.addRecipient ] - Cannot add recipient.',
                             'Error is :',
                             d.message
                           ].join(' '));
    }, this);

    // invalid statement
    return false;
  }

  // check if email is already in list
  if (!_.isUndefined(_.find(this.options.to,
                            { email : email, type : status.value.type }, 'email'))) {
    this.logger.warning([ '[ Mandrill.addRecipient ] - Cannot add recipient.',
                        'email already in', status.value.type, 'list.',
                        email, 'was omit'
                      ].join(' '));
    return false;
  }

  // Add object email to current option
  this.options.to.push(status.value);

  // log added action
  this.logger.info([ '[ Mandrill.addRecipient ] - email :',
                      status.value.email, 'was added into current send list, into [',
                      status.value.type, '] rules'
                   ].join(' '));

  // default statement
  return true;
};

/**
 * Get current state usage for mandrill wrapper
 *
 * @param {Boolean} showError true is we want to display error on is ready verification
 * @return {Boolean} return true if is ready, false otherwise
 */
Mandrill.prototype.isReady = function (showError) {
  // validation schema
  var schema = joi.object().keys({
    fromEmail   : joi.string().required(),
    html        : joi.string().required(),
    subject     : joi.string().required(),
    to          : joi.array().items(
                    joi.object().keys({
                      email : joi.string().email().required().trim(),
                      name  : joi.string(),
                      type  : joi.string().default('to').allow('to', 'cc', 'bcc')
                    })
                  ).min(1),
    text        : joi.string().required()
  }).unknown();

  // validate
  var status = joi.validate(this.options, schema);

  // show error request ??
  if (_.isBoolean(showError) && showError === true) {
    // has error ?
    if (!_.isNull(status.error)) {
      // log message
      _.each(status.error.details, function (d) {
        this.logger.error([ '[ Mandrill.isReady ] - Invalid items error is :',
                            d.message
                          ].join(' '));
      }, this);
    }
  }

  // default statement
  return !_.isEmpty(this.client) && _.isNull(status.error);
};

/**
 * Export the wrapper to use it on node
 */
module.exports = function (logger) {
  return new (Mandrill)(logger);
};
