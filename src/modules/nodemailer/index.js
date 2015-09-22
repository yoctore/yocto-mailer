'use strict';

var nodemailer      = require('nodemailer');
var smtpTransport   = require('nodemailer-smtp-transport');
var _               = require('lodash');
var joi             = require('joi');
var striptags       = require('striptags');
var Promise         = require('promise');
var Smtp            = require('smtp-connection');

/**
 * Yocto Nodemailer module wrapper
 *
 * This module manage your own Nodemailer SMTP Connecion
 *
 * @date : 11/09/2015
 * @author : Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module Mailer
 * @class Mandrill
 */
function NodeMailer (logger) {
  /**
  * The transporter for sending mail
  *
  * @property {Object} transport
  * @default empty
  */
  this.transport = {};

  /**
   * Structure of the object that contains all mail options
   *
   * @property {Object} mailOptions
   * @default {
   *     from      : '',
   *     sender    : '',
   *     to        : '',
   *     subject   : '',
   *     html      : '',
   *     text      : '',
   *     cc        : '',
   *     bcc       : ''
   *     encoding  : ''
   * }
   */
  this.options = {
    from      : {}, // sender address
    sender    : {}, // // sender email
    to        : [], // list of receivers
    subject   : '', // Subject line
    html      : '', // html body
    text      : '', // text body
    cc        : [], // cc receivers
    bcc       : [], // bcc reveivers,
    encoding  : 'utf-8', // default encoding
    replyTo   : ''
  };

  /**
   * Clone the options and omit parameter <code>from'</code> & <code>sender</code>
   * It used on clean method after sending an email
   *
   * @property {Object} defaultMailOtpion
   * @default {
   *     to        : '',
   *     subject   : '',
   *     html      : '',
   *     text      : '',
   *     cc        : '',
   *     bcc       : ''
   *     encoding  : ''
   * }
   */
  this.defaultOption = _.omit(_.clone(this.options), [ 'from', 'sender' ]);

  /**
   * Default logger instance
   *
   * @property {Object} logger
   */
  this.logger = logger;
}

/**
 * Set the nodemailer configuration
 *
 * @method setConfig
 * @param {Object} config Config Object to use with nodemailer
 *
 * @example
 * <code>mailer.mandrill.setConfig({});</code>
 */
NodeMailer.prototype.setConfig = function (config) {
  // save current context
  var context = this;

  // default statement
  return new Promise(function (fullfil, reject) {
    // validation schema
    var schema = joi.object().keys({
      port                : joi.number().required().min(0).max(65536),
      host                : joi.string().required(),
      secure              : joi.boolean().required(),
      auth                : joi.object().keys({
        user    : joi.string().email().required(),
        pass    : joi.string().required()
      }).allow('user','pass'),
      ignoreTLS           : joi.boolean().optional(),
      name                : joi.string().optional(),
      localAddress        : joi.string().optional(),
      connectionTimeout   : joi.number().min(0).default(30000),
      greetingTimeout     : joi.number().min(0).default(10000),
      socketTimeout       : joi.number().min(0).default(30000),
      debug               : joi.boolean().default(false),
    }).allow('host','secureConnection','port','auth', 'ignoreTLS',
             'localAddress', 'connectionTimeout', 'greetingTimeout',
             'socketTimeout', 'debug').required();

    // execute validation
    var result = joi.validate(config, schema);

    // check if have error on previous validation
    if (!_.isEmpty(result) && !_.isEmpty(result.error)) {
      context.logger.error('[ NodeMailer.setConfig ] - Setting smtp getting errors :');

      // Log each error
      _.each(result.error.details, function (d) {
        context.logger.error([ '[ NodeMailer.setConfig ] -', d.message ].join(' '));
      });

      reject('[ NodeMailer.setConfig ] - Error Occurs. Please check given configuration');
    } else {
      // assign validation value to config for default value
      config = result.value;
      // utility message
      context.logger.info('[ NodeMailer.setConfig ] - STMP Config seems to be valid.');
      context.logger.debug('[ NodeMailer.setConfig ] - Creating transport');
      // create transport
      context.transport = nodemailer.createTransport(smtpTransport(config));

      // Start test of connection & login
      context.logger.info('[ NodeMailer.setConfig ] - Testing SMTP Connection');

      // Build custom var
      var tConnect   = _.omit(_.clone(config), 'auth');
      var tLogin     = _.omit(_.clone(config), [ 'host', 'secureConnection', 'port']);
      var connection = new Smtp(tConnect);
      var message    = 'Connection test succed. Ready to use smtp connection';

      // error occured ?
      connection.on('error', function (err) {
        message = [ '[ NodeMailer.setConfig ] - Cannot connect to provided host.', err ].join(' ');
        // log message
        context.logger.error(message);
        // broadcast message
        reject(message);
        // quit connection
        connection.quit();
      });

      // Connect Event ?
      connection.on('connect', function () {
        context.logger.info([ '[ NodeMailer.setConfig ] - Connect on SMTP success.',
                              'Try to use given credidentials.' ].join(' '));

        // can login ?
        connection.login(tLogin.auth, function (err) {
          // has error
          if (err) {
            message =  [ '[ NodeMailer.setConfig ] - Invalid credidentials.',
                         'SMTP error is :', err.response ].join(' ');
            // log
            context.logger.error(message);
            // broadcast message
            reject(message);
          } else {
            fullfil(message);
          }
          // quit connection
          connection.quit();
        });
      });

      // run connection
      connection.connect();
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
NodeMailer.prototype.setExpeditor = function (email, name) {
  // define default object for validation
  var data = { address : email, name : name };

  // define validation schema
  var schema = {
    address  : joi.string().email().required().trim(),
    name     : joi.string()
  };

  // validate
  var status = joi.validate(data, schema);

  // has error ?
  if (!_.isNull(status.error)) {
    // log message
    _.each(status.error.details, function (d) {
      this.logger.error([ '[ NodeMailer.setExpeditor ] - Cannot set expeditor.',
                          'Error is :',
                          d.message
                        ].join(' '));
    }, this);

    // invalid statement
    return false;
  }

  // assign data
  _.merge(this.options.from, data);
  // assign sender property too
  this.options.sender =  data.address;

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
NodeMailer.prototype.addRecipient = function (email, name, type) {
  // define validation schema
  var schema = joi.object().keys({
    address : joi.string().email().required().trim(),
    name    : joi.string(),
    type    : joi.string().default('to').allow('to', 'cc', 'bcc')
  });

  // define type rules
  var data = { address : email, name : name, type : type };

  // valid recipient
  var status = joi.validate(data, schema);

  // has error ?
  if (!_.isNull(status.error)) {
    // log message
    _.each(status.error.details, function (d) {
      this.logger.error([ '[ NodeMailer.addRecipient ] - Cannot add recipient.',
                             'Error is :',
                             d.message
                           ].join(' '));
    }, this);

    // invalid statement
    return false;
  }
  // check if email is already in list
  if (!_.isUndefined(_.find(this.options[status.value.type], { address : email }, 'address'))) {
    this.logger.warning([ '[ NodeMailer.addRecipient ] - Cannot add recipient.',
                        'email already in', status.value.type, 'list.',
                        email, 'was omit'
                      ].join(' '));
    return false;
  }

  // reassign type when needed
  type         = status.value.type;
  // exclude type property to current object
  status.value = _.omit(status.value, 'type');

  // Add object email to current option
  this.options[type].push(status.value);

  // log added action
  this.logger.info([ '[ NodeMailer.addRecipient ] - email :',
                      status.value.address, 'was added into current send list, into [',
                      type, '] rules'
                   ].join(' '));

  // default statement
  return true;
};

/**
 * Add a reply to current mailer
 *
 * @param {String} email current email to use for reply to
 * @return {Boolean} true if all is ok false otherwise
 */
NodeMailer.prototype.addReplyTo = function (email) {
  // define schema
  var schema = joi.string().email().required().trim();

  // validate
  var status = joi.validate(email, schema);

  // has error ?
  if (!_.isNull(status.error)) {
    // log message
    _.each(status.error.details, function (d) {
      this.logger.error([ '[ NodeMailer.addReplyTo ] - Cannot add a reply-to.',
                          'Error is :',
                          d.message
                        ].join(' '));
    }, this);

    // invalid statement
    return false;
  }

  // assign data
  this.options.replyTo = email;

  // default statement
  return true;
};

/**
 * Send the mail with all parameters
 * After the mail was send this paramater will be remove : to, cc, bcc, subject, message
 *
 * @method send
 * @param {String} subject Subject of the email
 * @param {String} message Html message to send
 */
NodeMailer.prototype.send = function (subject, message) {
  // send mail with defined transport object
  this.logger.debug('[ NodeMailer.send ] - Try sending a new email ...');

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
      context.logger.error('[ NodeMailer.send ] - can\'t send mail, invalid configuration.');

      // reject
      reject('[ NodeMailer.send ] - can\'t send mail, invalid configuration.');
    } else {
      // clone options for usage
      var coptions = _.clone(context.options);

      // Clean option for the next request
      context.logger.debug('[ NodeMailer.send ] - Cleanning object before send request');
      context.clean();

      // is clean and ready to send ?
      if (!context.clean(false, true)) {
        context.logger.error([ '[ NodeMailer.send ] - can\'t send email',
                               'option object is not properly clean' ].join(' '));
        // failed callback
        reject('[ NodeMailer.send ] - can\'t send email option object is not properly clean');
      }

      // log message
      context.logger.info('[ NodeMailer.send ] - Sending a new email ...');
      // Send email
      context.transport.sendMail(coptions, function (err, info) {
        if (err) {
          // error callback
          reject(err);
        } else {
          // success callback
          fulfill(info);
        }
      });
    }
  });
};

/**
 * Default clean function for the next item
 *
 * @param {Boolean} all true for complete cleaning
 * @param {Boolean} onlyStatus true if we want only the current status of cleaning state
 * @return {Boolean} true if all is clean, false otherwise
 */
NodeMailer.prototype.clean = function (all, onlyStatus) {

  // process these only is normal process is asked
  if (!_.isBoolean(onlyStatus) || (_.isBoolean(onlyStatus) && onlyStatus === false)) {
    // reset text element
    this.options.subject = this.options.html = this.options.text = '';
    // reset to items
    this.options.to      = [];
    this.options.cc      = [];
    this.options.bcc     = [];

    // clean all config ?
    if (_.isBoolean(all) && all === true) {
      // re init with default value
      _.extend(this.options, this.defaultOption);
    }
  } else {
    // validate new schema again all must be ok after clean
    var schema = joi.object().keys({
      from        : joi.object().keys({
        address  : joi.string().email().required().trim(),
        name     : joi.string()
      }),
      to          : joi.array().length(0),
      cc          : joi.array().length(0),
      bcc         : joi.array().length(0),
      subject     : joi.string().empty(''),
      html        : joi.string().empty(''),
      text        : joi.string().empty(''),
      replyTo     : joi.string().empty('')
    }).unknown();

    // validate the cleaning state
    var status = joi.validate(this.options, schema);

    // has error ?
    if (!_.isNull(status.error)) {
      // log message
      _.each(status.error.details, function (d) {
        this.logger.error([ '[ NodeMailer.clean ] - Cannot clean current object.',
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
 * Get current state usage for nodeMailer wrapper
 *
 * @param {Boolean} showError true is we want to display error on is ready verification
 * @return {Boolean} return true if is ready, false otherwise
 */
NodeMailer.prototype.isReady = function (showError) {
  var schema = joi.object().keys({
    from        : joi.object().keys({
      address : joi.string().email().required().trim(),
      name    : joi.string().optional()
    }),
    html        : joi.string().required(),
    subject     : joi.string().required(),
    to          : joi.array().items(
                    joi.object().keys({
                      address : joi.string().email().required().trim(),
                      name    : joi.string()
                    })
                  ).min(1),
    cc          : joi.array().items(
                    joi.object().keys({
                      address : joi.string().email().required().trim(),
                      name    : joi.string()
                    })
                  ),
    bcc         : joi.array().items(
                    joi.object().keys({
                      address : joi.string().email().required().trim(),
                      name    : joi.string()
                    })
                  ),
    text        : joi.string().required(),
    sender      : joi.string().email().required().trim()
  }).unknown();

  // validate
  var status = joi.validate(this.options, schema);

  // show error request ??
  if (_.isBoolean(showError) && showError === true) {
    // has error ?
    if (!_.isNull(status.error)) {
      // log message
      _.each(status.error.details, function (d) {
        this.logger.error([ '[ NodeMailer.isReady ] - Invalid items error is :',
                            d.message
                          ].join(' '));
      }, this);
    }
  }

  // default statement
  return !_.isEmpty(this.transport) && _.isNull(status.error);
};

/**
* Export the wrapper to use it on node
*/
module.exports = function (logger) {
  return new (NodeMailer)(logger);
};
