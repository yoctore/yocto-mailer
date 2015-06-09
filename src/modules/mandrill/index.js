'use strict';

var mandrill = require('mandrill-api/mandrill');
var _        = require('lodash');
var joi      = require('joi');
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
}

/**
* Set the mandrill client apiKey to connect to mandrill service
*
* @method setMandrillClientAPIKey
* @param {Object}  apiKey The apikey of mandrill service
* @example example of usage
*    mailer.mandrill.setMandrillClientAPIKey('JFEKFEa-738dKJFEç-OLN974');
*/
MandrillWrapper.prototype.setMandrillClientAPIKey = function(apiKey) {

  if (_.isString(apiKey)) {
    this.mandrill_client = new mandrill.Mandrill(apiKey);
  }
};

/**
* Add a new recipient or an array of recipient<br/>
* This will add a new recipient to the array of recipient
*
* @method addRecipient
* @param {Object, Array} rec
* @return {Boolean} true if success, false otherwise
* @example
*
*var user = {
*  name  : 'Foo Bar',
*  email : 'foo@bar.com'
*};
* mailer.nodemailer.addRecipient(user);
*/
MandrillWrapper.prototype.addRecipient = function(rec) {

  return this.processEmailFormat(rec, 'to');
};

/**
* Set the expeditor <br/>
* This param is save in memory
*
* @method setExpeditor
* @param {String}  from email of the exoeditor
* @return {Boolean} true if success, false otherwise
*/
MandrillWrapper.prototype.setExpeditor = function(from) {

  //From email should be a string
  if (!_.isString(from)) {
    return 'Error - from_email should be a string email';
  }
  return this.processEmailFormat(from, 'from_email');
};

/**
* Add a new CC recipient or an array of CC recipient<br/>
* This will add a new cc to the array of cc
*
* @method addCC
* @param {Object, Array}  cc
* @return {Boolean} true if success, false otherwise
*
* @example
*
*var user = {
*  name  : 'Foo Bar',
*  email : 'foo@bar.com'
*};
* mailer.nodemailer.addCC(user);
*/
MandrillWrapper.prototype.addCC = function(cc) {

  return this.processEmailFormat(cc, 'to', 'cc');
};

/**
* Add a new BCC recipient or an array of BCC recipient<br/>
* This will add a new cc to the array of Bcc
*
* @method addBCC
* @param {Object, Array} bcc
* @return {Boolean} true if success, false otherwise
*
* @example
*
*var user = {
*  name  : 'Foo Bar',
*  email : 'foo@bar.com'
*};
* mailer.nodemailer.addBCC(user);
*/
MandrillWrapper.prototype.addBCC = function(bcc) {

  return this.processEmailFormat(bcc, 'to', 'bcc');
};

/**
* Check if object 'data' conatains only email <br/>
* If it's not case return false and logg an error <br/>
* Else add 'data' into Mailer.mailOptions.<option>
*
* @method processEmailFormat
* @private
* @param {String, Array, Object}  data that shoul'd be contains email
* @param option It's the name of the property in Mailer.mailOptions
* @param option2 It's an optional otpion to specify if it's an cc, bcc
* @return {Boolean} true if success, false otherwise
*/
MandrillWrapper.prototype.processEmailFormat = function(data, option, option2) {

  if (option !== 'from_email' && !_.isObject(data)) {
    logger.error('Error ' + option + ' should be on object or array of object');
    return 'Error ' + option + ' should be on object or array of object';
  }

  //Set a default value
  var result = joi.string().email();

  if (_.isObject(data)) {

    //data is an array
    if (_.isArray(data)) {

      //Add params type to each user
      _.forEach(data, function(user) {

        user = _.merge(user, { type : (_.isEmpty(option2) ? option : option2) });
      });

      //Define joi schema
      result = joi.array().items(
        joi.object().keys({
          email : joi.string().email(),
          name  : joi.string(),
          type  : joi.string()
        })
      );
    } else {
      // Data is an Object
      // Add param type in data
      data = _.merge(data, { type : (_.isEmpty(option2) ? option : option2) });  // add the param 'type'

      //Define joi schema
      result = joi.object().keys({
        email : joi.string().email(),
        name  : joi.string(),
        type  : joi.string()
      });
    }
  }

  //Execute the joi vailidation
  result = result.validate(data);

  //Check if have no error in joi validation
  if (_.isEmpty(result) || _.isEmpty(result.error)) {
    logger.debug('[ MandrillWrapper.processEmailFormat ] - Validation email for field : ' +  (_.isEmpty(option2) ? option : option2));

    //test the type of param in mailOptions
    if (_.isArray(this.mailOptions[option]) && _.isObject(data)) {
      //is an array

      //Change result if needed
      if (_.isArray(data)) {

        //is an array
        _.forEach(data, function(user) {
          this.mailOptions[option].push(user);
        }, this);
        return true;
      }

      //is an object
      this.mailOptions[option].push(data);
      return true;
    }

    //the param is a string
    this.mailOptions[option] = data;
    return true;
  }

  logger.error('[ MandrillWrapper.processEmailFormat ] - Validation email failed, at least one string dosen\'t pass email validation for field : ' + option);
  console.log(result.error);
  return false;
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
  logger.debug('[ MandrillWrapper.send ] - Try sending a new email');

  if (_.isString(message)) {
    this.mailOptions.html = message;
  }

  if (_.isString(subject)) {
    this.mailOptions.subject = subject;
  }

  //Default callback will call in case where 'callback' is empty
  function defaultCallbackSendMail(info) {

    logger.info('[ MandrillWrapper.send.defaultCallBackSendMail ] - message sent, more info : ' + info);
  }

  //Default callback will call in case where 'callback' is empty
  function defaultFailedCallbackSendMail(error) {

    logger.error('[ MandrillWrapper.send.defaultCallBackSendMail ] -  error sending message, more details : ' + error);
  }

  //saveContext for deleteMailOptions()
  var context = this;

  //Function that delete all params in this.mailOptions expect 'from'
  function deleteMailOptions() {

    logger.debug('[ MandrillWrapper.deleteMailOptions ] - Delete mail otpions');

    //Extend defaultMailOption to remove this mail options : to, cc, bcc, html
    _.extend(context.mailOptions, context.defaultMailOption);
  }

  //Check if somes params are not empty
  if (!_.isEmpty(this.mandrill_client) && !_.isEmpty(this.mailOptions.to) &&
  !_.isEmpty(this.mailOptions.from_email)  && !_.isEmpty(this.mailOptions.subject)  &&
  !_.isEmpty(this.mailOptions.html)) {

    return this.mandrill_client.messages.send({ "message": this.mailOptions, "async": false }, function(result) {

      // Success Callback

      //Determine which callback is called
      if (!_.isFunction(callback)) {
        defaultCallbackSendMail(result);
      } else {
        callback(result);
      }

      //Delete mail options
      deleteMailOptions();
      return true;

    } , function(e) {
      // failed callback
      //
      //Determine which callback is called
      if (!_.isFunction(callbackFailed)) {
        defaultFailedCallbackSendMail(e);
      } else {
        callbackFailed(e);
      }

      //Delete mail options
      deleteMailOptions();
      return false;
    });
  }
  //At least one params are empty, so the mail will be not sent
  logger.error('[ MandrillWrapper.send ] - can\'t send mail, please check configuration.');

  //Delete mail options
  deleteMailOptions();
  return false;
};

/**
* Export the wrapper to use it on node
*/
module.exports = new (MandrillWrapper)();
