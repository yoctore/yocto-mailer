'use strict';

var mandrill = require('mandrill-api/mandrill');
var _        = require('lodash');
var logger   = require('yocto-logger');


/**
* Yocto MandrillWrapper
*
* This module manage your own mailer
*
* This module his a wrapper of mandrill-api for node js package
*
* For more details on used dependencies read links below :
* - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
* - LodAsh : https://lodash.com/
* - joi : https://github.com/hapijs/joi
* - mandrill-api : https://www.npmjs.com/package/mandrill-api
*
* @date : 08/06/2015
* @author : Cédric BALARD <cedric@yocto.re>
* @copyright : Yocto SAS, All right reserved
* @class MandrillWrapper
*/
function MandrillWrapper() {

  /**
  * The mandrill client for sending mail
  *
  * @property {Object} mandrill_client
  * @default empty
  */
  this.mandrill_client = {};

  /**
  * Structure of the object that contains all mail options
  *
  * @property {Object} mailOptions
  * @default {
  * 	  from_email    : '',
  *     to      : '',
  *     subject : '',
  *     html    : ''
  *     }
  */
  this.mailOptions = {
    from_email  : '', // sender address
    to          : [], // list of receivers
    subject     : '' // Subject line
  };

  /**
  * Clone the mailOptions and omit parameter 'from_email'<br/>
  * It used for deleteMailOptions when a mail as sent to reinitialize it<br/>
  *
  * @property {Object} defaultMailOtpion
  *  @default {
  *     to      : '',
  *     subject : '',
  *     html    : '',
  *     }
  */
  this.defaultMailOption = _.omit(_.clone(this.mailOptions), 'from_email');

  /**
   * Default this.logger properties
   *
   * @property {Object} this.logger
   */
  this.logger = logger;
}


/**
* Set the mandrill client apiKey to connect to mandrill service
*
* @method setMandrillClientAPIKey
* @param {Object}  apiKey The apikey of mandrill service
* @example example of usage
*    mailer.mandrill.setMandrillClientAPIKey('JFEKFEa-738dKJFEç-OLN974');
*/
MandrillWrapper.prototype.setConfig = function(apiKey) {

  if (_.isString(apiKey)) {
    this.mandrill_client = new mandrill.Mandrill(apiKey);
    return true;
  }
  this.logger.error('[ MandrillWrapper.setConfig ] - The api key should be a String');
};


/**
* Send the mail with all parameters ( from_email, to, cc , bcc)<br/>
* After the mail was send this paramater will be remove : to, cc, bcc, subject, message
*
* @method send
* @param {String} subject Subject of the email
* @param {String} message Html message to send
* @param {Function} callback on optional success callback, If is not specied a default callback will be execute
* @param {Function} callbackFailed on optional failed callback, If is not specied a default callback will be execute
* @example Obligatory step before call this method
* 1. require the module like this : var mandrill = require('MandrillWrapper');
* 2. set a valid mandrill apiKey
* 3. set an expeditor
* 4. set at least one recipient
*     - You can optionaly add CC or BCC receivers
* 5. call send() with your subject and contents for sending your email
*/
MandrillWrapper.prototype.send = function(subject, message, callback, callbackFailed) {

  // send mail with defined transport object
  this.logger.debug('[ MandrillWrapper.send ] - Try sending a new email');

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

  //saveContext for deleteMailOptions()
  var context = this;

  //Function that delete all params in this.mailOptions expect 'from'
  function deleteMailOptions(context) {

    context.logger.debug('[ MandrillWrapper.deleteMailOptions ] - Delete mail otpions');

    //Extend defaultMailOption to remove this mail options : to, cc, bcc, html
    _.extend(context.mailOptions, context.defaultMailOption);
  }

  //Check if somes params are not empty
  if (!_.isEmpty(this.mandrill_client) && !_.isEmpty(this.mailOptions.to) && !_.isEmpty(this.mailOptions.from_email)  && !_.isEmpty(this.mailOptions.subject)  && !_.isEmpty(this.mailOptions.html)) {

    this.mandrill_client.messages.send({ "message": this.mailOptions, "async": false }, function(result) {

      // Success Callback
      callback(result);
    } , function(error) {

      // failed callback
      callbackFailed(error);
    });

    deleteMailOptions(context);

  } else {
    //At least one params are empty, so the mail will be not sent
    this.logger.error('[ MandrillWrapper.send ] - can\'t send mail, please check configuration.');

    //Delete mail options
    deleteMailOptions(this);
  }
};

/**
* Export the wrapper to use it on node
*/
module.exports = new (MandrillWrapper)();
