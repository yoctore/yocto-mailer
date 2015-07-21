'use strict';

var nodemailer  = require('./modules/nodemailer/');
var mandrill    = require('./modules/mandrill/');
var logger      = require('yocto-logger');
var _           = require('lodash');
var joi         = require('joi');
var promise     = require('promise');

/**
* Yocto Mailer
*
* This module implements two yocto wrapper, one for nodemailer, the second for mandrill
*
** For more details on used dependencies read links below :
* - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
* - LodAsh : https://lodash.com/
* - joi : https://github.com/hapijs/joi
* - mandrill-api : https://www.npmjs.com/package/mandrill-api
* - promise : https://www.promisejs.org/
* @date : 09/06/2015
* @author : Cédric BALARD <cedric@yocto.re>
* @copyright : Yocto SAS, All right reserved
* @class Mailer
*/
function Mailer() {
  /**
  * Default unit instance for nodemailer
  *
  * @property nodemailer
  * @type nodemailer
  */
  this.nodemailer = nodemailer;

  /**
  * Default unit instance for mandrill
  *
  * @property mandrill
  * @type mandrill
  */
  this.mandrill = mandrill;

  /**
  * Conatains the wrapper that will be used
  *
  * @property mailerType
  */
  this.mailerType   = {};

  /**
  * The wrapper that will be used in sting
  *
  * @property mailerType
  * @type string
  */
  this.mailerTypeString = '';

  /**
  * The logger
  *
  * @property mailerType
  */
  this.logger = logger;
}

/**
* Default get function
*
* @method get
* @return {Mixed} wanted property
*/
Mailer.prototype.get = function(name) {
  return this[name];
};

/**
* Before use a mailer you should define one mailer with ths <br/>
* You can choose :
*  - nodemailer
*  - mandrill
*
* @method use
* @return {Mixed} wanted property
* @example
*
* mailer.use(nodemailer);
*/
Mailer.prototype.use = function(mailerType) {

  if (mailerType.toLowerCase() === 'nodemailer') {
    this.mailerType = this.nodemailer;
    this.mailerTypeString = 'nodemailer';
    return;
  }

  if (mailerType.toLowerCase() === 'mandrill') {
    this.mailerType = this.mandrill;
    this.mailerTypeString = 'mandrill';
    return;
  }

  this.logger.error('[ Mailer.use ] - You should use "nodemailer" or "mandrill"');

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
Mailer.prototype.addRecipient = function(rec) {

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
Mailer.prototype.setExpeditor = function(from) {

  //From email should be a string
  if (!_.isString(from)) {
    logger.error('Expeditor should be a string email');
    return false;
  }

  //Option determine in which param the bcc user should be in mailOptions
  var option = 'from_email'; // to for mandrill
  if (this.mailerTypeString === 'nodemailer') {
    option = 'from';
  }

  return this.processEmailFormat(from, (this.mailerTypeString == 'nodemailer' ? 'from' : 'from_email'));
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
Mailer.prototype.addCC = function(cc) {
  //Option determine in which param the cc user should be in mailOptions
  var option = 'to'; // to for mandrill
  if (this.mailerTypeString === 'nodemailer') {
    option = 'cc';
  }

  return this.processEmailFormat(cc, option, 'cc');
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
Mailer.prototype.addBCC = function(bcc) {
  //Option determine in which param the bcc user should be in mailOptions
  var option = 'to'; // to for mandrill
  if (this.mailerTypeString === 'nodemailer') {
    option = 'bcc';
  }

  return this.processEmailFormat(bcc, option, 'bcc');
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
Mailer.prototype.processEmailFormat = function(data, option, option2) {

  if (_.isEmpty(this.mailerType)) {
    this.logger.error('MailerType is not define, please define your mailer whith use(String) function !');
    return;
  }

  this.logger.info('[ Mailer.processEmailFormat ] - start  typeof data : ' + typeof data);

  if (option !== 'from_email' && option !== 'from'  && !_.isObject(data)) {
    this.logger.error('[ Mailer.processEmailFormat ] Error ' + option + ' should be on object or array of object');
    return false;
  }

  //Set a default value
  var result = joi.string().email();

  if (_.isObject(data)) {

    //data is an array
    if (_.isArray(data)) {

      //Add params type to each user
      _.forEach(data, function(user) {

        user.address = user.email;
        user.type = (_.isEmpty(option2) ? option : option2) ;
      });

      //Define joi schema
      result = joi.array().items(
        joi.object().keys({
          email : joi.string().email(),
          address : joi.string().email(),
          name  : joi.string(),
          type  : joi.string()
        })
      );
    } else {
      // Data is an Object
      // Add param type in data
      data = _.merge(data, { type : (_.isEmpty(option2) ? option : option2) });  // add the param 'type'

      //Add params address to nodemailer
      data.address = data.email;

      //Define joi schema
      result = joi.object().keys({
        email : joi.string().email(),
        address : joi.string().email(),
        name  : joi.string(),
        type  : joi.string()

      });
    }
  }

  //Execute the joi vailidation
  result = result.validate(data);

  //Check if have no error in joi validation
  if (_.isEmpty(result) || _.isEmpty(result.error)) {
    this.logger.debug('[ MandrillWrapper.processEmailFormat ] - Validation email for field : ' +  (_.isEmpty(option2) ? option : option2));

    //test the type of param in mailOptions
    if (_.isArray(this.mailerType.mailOptions[option]) && _.isObject(data)) {
      //is an array

      //Change result if needed
      if (_.isArray(data)) {

        //is an array
        _.forEach(data, function(user) {
          this.mailerType.mailOptions[option].push(user);
        } , this);
        return true;
      }

      //is an object
      this.mailerType.mailOptions[option].push(data);
      return true;
    }

    //the param is a string
    this.mailerType.mailOptions[option] = data;

    return true;
  }

  console.log(result);
  this.logger.error('[ MandrillWrapper.processEmailFormat ] - Validation email failed, at least one string dosen\'t pass email validation for field : ' + option);
  return false;
};

/**
 * Wrap the setconfig() of mailer
 * @method setConfig
 * @param  {String, Ojbect} conf The configuration, should be a string for mailchimp (apikey). For nodemailer should be a Object (smtpConf)
 */
Mailer.prototype.setConfig = function(conf) {

  if (_.isEmpty(this.mailerType)) {
    this.logger.error('MailerType is not define, please define your mailer whith use(String) function !');
    return;
  }

  this.mailerType.setConfig(conf);
};

/**
 * Wrap the send() of mailer
 * Implements promise to handle success and error
 * @method setConfig
 * @param  {String} subject subject of message
 * @param {String} message content of message in Html
 * @callback {Function} callback success callback
 * @callback {Function} callbackFailed Failed callback
 * @example
 * var success = function(value) {
 * 	 logger.info( 'youhou mail sent');
 *   console.log(value);
 * };
 *
 * var failed = function(error) {
 *   logger.error( 'oin oin mail not sent');
 *   console.log(error);
 * };
 *
 * mailer.send(' #321 nodemailer ', '<b> test tab </b>').then(success, failed);
 */
Mailer.prototype.send = function(subject, message) {
  if (_.isEmpty(this.mailerType)) {
    this.logger.error('MailerType is not define, please define your mailer whith use(String) function !');
    return;
  }
  //Save context
  var context = this;

  //Declare promise
  return new promise(function(fulfill, reject) {
    context.mailerType.send(subject, message, function(res) {
      fulfill(res);
    } , function(err) {
      reject(err);
    });
  });
};

/**
* Export Mailer
*/
module.exports = new (Mailer)();
