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
* - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
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
NodeMailer.prototype.setConfigSMTP = function(smtpConf) {

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
    logger.error('[ NodeMailer.setConfigSMTP ] - setting smtp, error description :');

    //Log each error
    _.forEach(result.error.details, function(val) {
      logger.warning('[ NodeMailer.setConfigSMTP ] - ' + val.message + ' at ' + val.path);
    });
    return false;
  }

  logger.info('[ NodeMailer.setConfigSMTP ] - Set smtp configuration ok');
  this.transport = nodemailer.createTransport(smtpTransport(smtpConf));
  return true;
};

/**
* Add a new recipient or an array of recipient<br/>
* This will add a new recipient to the array of recipient
*
* @method addRecipient
* @param {Object, Array}
* @return {Boolean} true if success, false otherwise
* @example
*
*var user = {
*  name  : 'Foo Bar',
*  email : 'foo@bar.com'
*};
* mailer.nodemailer.addRecipient(user);
*/
NodeMailer.prototype.addRecipient = function(to) {

  return this.processEmailFormat(to, 'to');
};

/**
* Set the expeditor <br/>
* This param is save in memory
*
* @method setExpeditor
* @param {String} from email of the exoeditor
* @return {Boolean} true if success, false otherwise
*/
NodeMailer.prototype.setExpeditor = function(from) {

  if (!_.isString(from)) {
    logger.error('Error - from_email should be a string email');
    return 'Error - from_email should be a string email';
  }
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
NodeMailer.prototype.addCC = function(cc) {

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
NodeMailer.prototype.addBCC = function(bcc) {

  return this.processEmailFormat(bcc, 'bcc');
};

/**
* Check if object 'data' conatains only email <br/>
* If it's not case return false and logg an error <br/>
* Else add 'data' into NodeMailer.mailOptions.<option>
*
* @method processEmailFormat
* @private
* @param {String, Array}  data that shoul'd be contains only email
* @param option It's the name of the property in NodeMailer.mailOptions
* @return {Boolean} true if success, false otherwise
*/
NodeMailer.prototype.processEmailFormat = function(data, option) {

  //Test type, only param 'from' should be a string
  if (option !== 'from' && _.isString(data)) {
    logger.warning('Error ' + option + ' should be on object or array of object');
    return 'Error ' + option + ' should be on object or array of object';
  }

  //Set a default value
  var result = joi.string().email();

//Determine wich type data is for define the good joi shecma
  if (_.isObject(data)) {

    if (_.isArray(data)) {

      result = joi.array().items(
        joi.object().keys({
          email : joi.string().email(),
          name  : joi.string(),
          type  : joi.string()
        })
      );

    } else {

      data.address = data.email;
      delete data.email;

      result = joi.object().keys({
        address : joi.string().email(),
        name    : joi.string()
      });
    }
  }

  //Execute the joi vailidation
  result = result.validate(data);

  //Check if have no error in joi validation
  if (_.isEmpty(result) || _.isEmpty(result.error)) {
    logger.debug('[ NodeMailer.processEmailFormat ] - Validation email for field : ' + option);

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

  console.log(result.error);
  logger.error('[ NodeMailer.processEmailFormat ] - Validation email failed, at least one string dosen\'t pass email validation for field : ' + option);
  return false;
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
NodeMailer.prototype.send = function(subject, message, callback) {

  // send mail with defined transport object
  logger.info('[ NodeMailer.send ] - Try sending a new email');

  if (_.isString(message)) {
    this.mailOptions.html = message;
  }

  if (_.isString(subject)) {
    this.mailOptions.subject = subject;
  }

  //Default callback will call in case where 'callback' is empty
  function defaultCallbackSendMail(info) {

    logger.info('[ MandrillWrapper.send.defaultCallBackSendMail ] - message sent, more info : ');
  }

  //Default callback will call in case where 'callback' is empty
  function defaultFailedCallbackSendMail(error) {

    logger.error('[ MandrillWrapper.send.defaultCallBackSendMail ] -  error sending message, more details : ' + error);
  }

  //saveContext for deleteMailOptions()
  var context = this;

  //Function that delete all params in this.mailOptions expect 'from'
  function deleteMailOptions() {

    logger.debug('[ NodeMailer.deleteMailOptions ] - Delete mail otpions');

    //Extend defaultMailOption to remove this mail options : to, cc, bcc, html
    _.extend(context.mailOptions, context.defaultMailOption);
  }

  //Check if somes params are not empty
  if (!_.isEmpty(this.transport) && !_.isEmpty(this.mailOptions.to) &&
  !_.isEmpty(this.mailOptions.from)  && !_.isEmpty(this.mailOptions.subject)  &&
  !_.isEmpty(this.mailOptions.html)) {

    //SendMail
    this.transport.sendMail(this.mailOptions, function(error, info) {

      //Determine if we call success or failed callback
      if (_.isEmpty(error))
      {
        //Success Callback
        //Determine which callback is called
        if (!_.isFunction(callback)) {
          defaultCallbackSendMail(info);
        } else {
          callback(info);
        }

        //Delete mail options
        deleteMailOptions();
        return true;
      }

      // failed callback
      //Determine which callback is called
      if (!_.isFunction(callback)) {
        defaultFailedCallbackSendMail(error);
      } else {
        callbackFailed(error);
      }
      //Delete mail options
      deleteMailOptions();
      return true;
    });
  } else {

    //At least one params are empty, so the mail will be not sent
    logger.error('[ NodeMailer.send ] - can\'t send mail, please check configuration.');

    //Delete mail options
    deleteMailOptions();
  }
};

/**
* Export the wrapper to use it on node
*/
module.exports = new (NodeMailer)();
