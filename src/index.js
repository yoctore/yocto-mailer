'use strict';

var nodemailer      = require("nodemailer");
var smtpTransport   = require('nodemailer-smtp-transport');
var logger          = require('yocto-logger');
var _               = require('lodash');
var joi             = require('joi');
var util            = require('util');

/**
 * Yocto Mailer
 *
 * This module manage your own mailer
 *
 * This module his a wrapper of nodemailer for node js package
 *
 * For more details on used dependencies read links below :
 * - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
 * - lodash : https://lodash.com/
 * - joi : https://github.com/hapijs/joi
 * - nodemailer : https://github.com/andris9/Nodemailer
 * - nodemailer-smtp-transport : https://github.com/andris9/nodemailer-smtp-transport
 *
 * @date : 29/04/2015
 * @author : Cédric BALARD <cedric@yocto.re>
 * @author : Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 * @class Mailer
 */
function Mailer() {
  /**
   * The transporter for sending mail
   *
   * @property {Object} transport
   * @default empty
   */
  this.transport = {};

  /*
   * Default logger instance
   *
   * @property {Object} logger
   */
  this.logger = logger;

  /**
   * Structure of the object that contains all mail options
   *
   * @property {Object} mailOptions
   * @default {
   * 	   from    : '',
   *     to      : '',
   *     subject : '',
   *     html    : '',
   *     cc      : '',
   *     bcc     : ''
   *     }
   */
  this.mailOptions = {
      from    : '', // sender address
      to      : '', // list of receivers
      subject : '', // Subject line
      html    : '', // html body
      cc      : '', // cc receivers
      bcc     : ''  // bcc reveivers
  };

  /**
   * Clone the mailOptions and omit parameter 'from'<br/>
   * It used for deleteMailOptions when a mail as sent <br/>
   * Only 'cc' and 'bcc' are optionals
   *
   * @property {Object} defaultMailOtpion
   *  @default {
   *     to      : '',
   *     subject : '',
   *     html    : '',
   *     cc      : '',
   *     bcc     : ''
   *     }
   */
  this.defaultMailOption = _.omit(_.clone(this.mailOptions), 'from');
}

/**
 * Set the smtp configuration <br/>
 * Before set the configuration we check with joi all parameters it's correct<br/>
 * If is correct we set configuration, otherwise no
 *
 * @method setConfigSMTP
 * @param {Object}  smtpConf New smtp configuration
 * @return {Boolean} true if success, false otherwise
 * @example The structure off smtpShould be obligatory : {
 *     host                : {string},
 *     secureConnection    : {string},
 *     port                : {number},
 *     auth                : {
 *         user    : {string},
 *         pass    : {string}
 *     }
 * }
 */
Mailer.prototype.setConfigSMTP = function(smtpConf) {
  
  // Construct a schema to check if smtpConf is ok
  var schema = joi.object().keys({
      host                : joi.string().required(),
      secureConnection    : joi.boolean().required(),
      port                : joi.number().required(),
      auth                : joi.object().keys({
          user    : joi.string().email().required(),
          pass    : joi.string().required()
      }).allow('user','pass')
  }).allow('host','secureConnection','port','auth');

  // execute validation
  var result = joi.validate(smtpConf, schema);

  // check if have error on previous validation
  if (!_.isEmpty(result) && !_.isEmpty(result.error)) {
    this.logger.error([ ' [ Mailer.setConfigSMTP ] - Config is invalid. error is : ', util.inspect(result.error.details, { depth : null }) ]);  
    
    return false;
  }

  logger.info('[ Mailer.setConfigSMTP ] - New config is valid.');
  
  // set transport
  this.transport = nodemailer.createTransport(smtpTransport(smtpConf));
  
  // return statement
  return true;
};

/**
 * Add a new recipient or an array of recipient<br/>
 * This will remove all previous recipient
 *
 * @method addRecipient
 * @param {String, Array}  dest if it's a string it's contains a email of recepients else if it's an array it contains an array of string (email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addRecipient = function(to) {
  return this.processEmailFormat(to, 'to');
};

/**
 * Set the expeditor <br/>
 * This param is save in memory
 *
 * @method setExpeditor
 * @param {String}  exp email of the exoeditor
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.setExpeditor = function(from) {
  console.log(from);
  return this.processEmailFormat(from, 'from');
};

/**
 * Add a new CC recipient or an array of CC recipient<br/>
 * This will remove all previous CC recipient
 *
 * @method addCC
 * @param {String, Array}  cc if it's a string it's contains a email of ccrecepients else if it's an array it contains an array of string (cc email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addCC = function(cc) {
  return this.processEmailFormat(cc, 'cc');
};

/**
 * Add a new BCC (CCI) recipient or an array of BCC recipient<br/>
 * This will remove all previous BCC recipient
 *
 * @method addBCC
 * @param {String, Array}  bcc if it's a string it's contains a email of ccrecepients else if it's an array it contains an array of string (bcc email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addBCC = function(bcc) {
  return this.processEmailFormat(bcc, 'bcc');
};

/**
 * Check if object 'data' conatains only email <br/>
 * If it's not case return false and logg an error <br/>
 * Else add 'data' into Mailer.mailOptions.<option>
 *
 * @method processEmailFormat
 * @private
 * @param {String, Array}  data that shoul'd be contains only email
 * @param option It's the name of the property in Mailer.mailOptions
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.processEmailFormat = function(data, option) {
  // Set a default value
  var result = joi.string().email().required().empty();

  // Change result if needed
  if (_.isArray(data)) {
    result = joi.array().min(1).items(joi.string().email().required().empty());
  }

  // validate options too
  var options = joi.string().required().empty().valid([ 'from', 'bcc', 'cc', 'to' ]).validate(option);
  
  // Execute the joi validation
  result = result.validate(data);

  // Check if have no error in joi validation
  if (_.isNull(result.error) && _.isNull(options.error)) {
      logger.info([ '[ Mailer.processEmailFormat ] - Checking field :', option, 'with data :', util.inspect(data, { depth : null }), 'is ok' ].join(' '));
      
      // set options
      this.mailOptions[option] = data;
      
      // return statement
      return true;
  }

  // saving errors for logging after
  var errors =  [ result.error, options.error ];
  
  // parse error
  _.each(errors, function(r) {
    if (!_.isNull(r) && _.has(r, 'details')) {
      // error message
      this.logger.error([ '[ Mailer.processEmailFormat ] - Validation failed. validate error is :\n', util.inspect(r.details, { depth : null }) ].join(' '));      
    }
  }, this);
  
  // returning statement
  return false;
};

/**
 * Send the mail with all parameters ( from, to, cc , bcc)<br/>
 * After the mail was send this paramater will be remove : to, cc, bcc, subject, message
 *
 * @method send
 * @param {String} subject Subject of the email
 * @param {String} message Html message to send
 * @param {Function} callback on optional callback, If is not specied a default callback will be execute
 * @example Obligatory step before call this method
 *
 * 1. require the module like this : var mailer = require('yocto-mailer');
 * 2. set a valid SMTP transport
 * 3. set an expeditor
 * 4. set at least one recipient
 *     - You can optionaly add CC or BCC receivers
 * 5. call send() with your subject and contents for sending your email
 */
Mailer.prototype.send = function(subject, message, callback) {
  
  // checking message
  if (_.isString(message)) {
    this.mailOptions.html = message;
  }

  // checking subject
  if (_.isString(subject)) {
    this.mailOptions.subject = subject;
  }

  // Check if somes params are not empty
  if (!_.isEmpty(this.transport) && !_.isEmpty(this.mailOptions.to) &&
      !_.isEmpty(this.mailOptions.from)  && !_.isEmpty(this.mailOptions.subject)  &&
      !_.isEmpty(this.mailOptions.html)) {

      // send mail with defined transport object
      this.logger.info([ '[ Mailer.send ] - Sending email to : ', this.mailOptions.to ].join(' '));      
      this.logger.debug([ '[ Mailer.send ] - Sending with option : ', util.inspect(this.mailOptions, { depth : null } ) ].join(' '));

      // saving context for mailer callback
      var context = this;
      
      // sending email
      this.transport.sendMail(this.mailOptions, function(error, info) {
        // prelog if error
        if (error) {
          context.logger.error([ '[ Mailer.send ] - An error occured during sending email. Error is :', util.inspect(error, { depth : null }) ].join(' '));
        } else {
          context.logger.info([ '[ Mailer.send ] - Sending email success. response is :\n', util.inspect(info, { depth : null }) ].join(' '));          
        }

        // callback is function ?
        if (_.isFunction(callback)) {
          // calling 
          callback(error, info);          
        }
      });

   } else {
      // At least one params are empty, so the mail will be not sent
      logger.error('[ Mailer.send ] - Configuration is invalid. Please check your settings.');
  }
  
  // clean mail options
  return this.clean();
};

/**
 * Default clean function. cleaning mail config option
 *
 * @method clean
 */
Mailer.prototype.clean = function() {
  this.logger.info('[ Mailer.clean ] - Cleaning mail otpions');
  
  // Extend defaultMailOption to remove this mail options : to, cc, bcc, html
  _.extend(this.mailOptions, this.defaultMailOption);
  
  // return mail Options
  return this.mailOptions;
};

/**
 * Export current Mailer to use it on node
 */
module.exports = new (Mailer)();
