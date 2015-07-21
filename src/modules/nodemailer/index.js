'use strict';

var nodemailer      = require("nodemailer");
var smtpTransport   = require('nodemailer-smtp-transport');
var logger          = require('yocto-logger');
var _               = require('lodash');
var joi             = require('joi');

/**
* Yocto Mailer
*
* This module manage your own mailer
*
* This module his a wrapper of nodemailer for node js package
*
* For more details on used dependencies read links below :
* - yocto-this.logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
* - LodAsh : https://lodash.com/
* - joi : https://github.com/hapijs/joi
* - nodemailer : https://github.com/andris9/Nodemailer
* - nodemailer-smtp-transport : https://github.com/andris9/nodemailer-smtp-transport
*
* @date : 29/04/2015
* @author : Cédric BALARD <cedric@yocto.re>
* @copyright : Yocto SAS, All right reserved
* @class NodeMailer
*/
function NodeMailer() {
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
    to      : [], // list of receivers
    subject : '', // Subject line
    html    : '', // html body
    cc      : [], // cc receivers
    bcc     : []  // bcc reveivers
  };

  /**
  * Clone the mailOptions and omit parameter 'from'<br/>
  * It used for deleteMailOptions when a mail as sent to reinitialize it <br/>
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

  /**
   * Default this.logger properties
   *
   * @property {Object} this.logger
   */
  this.logger = logger;
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
NodeMailer.prototype.setConfig = function(smtpConf) {

  //Construct a schema to check if smtpConf is ok
  var schema = joi.object().keys({
    host                : joi.string().required(),
    secureConnection    : joi.boolean().required(),
    port                : joi.number().required(),
    auth                : joi.object().keys({
      user    : joi.string().email().required(),
      pass    : joi.string().required()
    }).allow('user','pass')
  }).allow('host','secureConnection','port','auth');

  //execute validation
  var result = joi.validate(smtpConf, schema);

  //check if have error on previous validation
  if (!_.isEmpty(result) && !_.isEmpty(result.error)) {
    this.logger.error('[ NodeMailer.setConfigSMTP ] - setting smtp, error description :');

    //Log each error
    _.forEach(result.error.details, function(val) {
      this.logger.warning('[ NodeMailer.setConfigSMTP ] - ' + val.message + ' at ' + val.path);
    });
    return false;
  }

  this.logger.info('[ NodeMailer.setConfigSMTP ] - Set smtp configuration ok');
  this.transport = nodemailer.createTransport(smtpTransport(smtpConf));
  return true;
};

/**
* Send the mail with all parameters ( from, to, cc , bcc)<br/>
* After the mail was send this paramater will be remove : to, cc, bcc, subject, message
*
* @method send
* @param {String} subject Subject of the email
* @param {String} message Html message to send
* @param {Function} callback on optional success callback, If is not specied a default callback will be execute
* @param {Function} callbackFailed on optional failed callback, If is not specied a default callback will be execute
* @example Obligatory step before call this method
* 1. require the module like this : var mailer = require('NodeMailer');
* 2. set a valid SMTP transport
* 3. set an expeditor
* 4. set at least one recipient
*     - You can optionaly add CC or BCC receivers
* 5. call send() with your subject and contents for sending your email
*/
NodeMailer.prototype.send = function(subject, message, callback, callbackFailed) {

  // send mail with defined transport object
  this.logger.info('[ NodeMailer.send ] - Try sending a new email');

  // defining default value
  this.mailOptions.html     = _.isString(message) ? message : '';
  this.mailOptions.subject  = _.isString(subject) ? subject : '';

  // process callback
  callback = !_.isUndefined(callback) && _.isFunction(callback) ? callback : function(data) {
    this.logger.info('[ MandrillWrapper.send.defaultCallBackSendMail ] -  sending message, info details id : ' + data);
  };

  // process callback Failed
  callbackFailed = !_.isUndefined(callbackFailed) && _.isFunction(callbackFailed) ? callbackFailed : function(data) {
    this.logger.info('[ MandrillWrapper.send.defaultCallBackSendMail ] -  sending message, error details id : ' + data);
  };

  // saving context
  var context = this;

  /**
   * Delete mail option after sending data
   *
   * @method deleteMailOptions
   * @param {Object} context default context to use
   */
  function deleteMailOptions(context) {

    // logging message
    context.logger.debug('[ NodeMailer.deleteMailOptions ] - Delete mail otpions');

    // Extend defaultMailOption to remove this mail options : to, cc, bcc, html
    _.extend(context.mailOptions, context.defaultMailOption);

    // TODO : Véririfié si meme bug qu'avec mandrill : lors d'une boucle les params ne sont pas supprimé a cause de l'async
  }

  //Check if somes params are not empty
  if (!_.isEmpty(this.transport) && !_.isEmpty(this.mailOptions.to) && !_.isEmpty(this.mailOptions.from)  && !_.isEmpty(this.mailOptions.subject) && !_.isEmpty(this.mailOptions.html)) {

    // SendMail
    this.transport.sendMail(this.mailOptions, function(error, info) {

      if (_.isEmpty(error)) {
        callback(info);
      } else {
        callbackFailed(error);
      }

      // Delete mail options
      deleteMailOptions(context);
    });
  } else {

    // At least one params are empty, so the mail will be not sent
    this.logger.error('[ NodeMailer.send ] - can\'t send mail, please check configuration.');

    //Delete mail options
    deleteMailOptions(this);
  }
};

/**
* Export the wrapper to use it on node
*/
module.exports = new (NodeMailer)();
