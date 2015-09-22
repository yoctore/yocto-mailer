'use strict';

var logger      = require('yocto-logger');
var nodemailer  = require('./modules/nodemailer')(logger);
var mandrill    = require('./modules/mandrill')(logger);
var _           = require('lodash');
var Promise     = require('promise');

/**
 * yocto-mailer core interface
 *
 * This module implements wrappers for mailer api's.
 *
 * Implemented api :
 * - mandrill
 * - nodeMailer (TODO)
 *
 * Dependencies :
 *
 * - yocto-logger : https://www.npmjs.com/package/yocto-logger
 * - lodash : https://lodash.com/
 * - joi : https://github.com/hapijs/joi
 * - mandrill-api : https://www.npmjs.com/package/mandrill-api
 * - promise : https://www.promisejs.org/
 *
 * @date : 17/09/2015
 * @author : Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @class Mailer
 */
function Mailer () {
  /**
  * The logger
  *
  * @property logger
  */
  this.logger = logger;

  /**
   * Mailer instance definition
   *
   * @property mailers
   * @type Array
   */
  this.mailers = [
    // nodemailer definition
    {
      instance  : nodemailer,
      name      : 'nodemailer',

    },
    // mandrill definition
    {
      instance    : mandrill,
      name        : 'mandrill'
    }
  ];

  this.mailer = {};
}

/**
 * Accesor Method
 *
 * @param {String} name the current property name
 * @return {Mixed} the current needed property
 */
Mailer.prototype.get = function (name) {
  return this[name];
};

/**
 * Chose default mailer connector to use
 *
 * @param {String} connector the current name of wish connector
 * @return {Boolean} true if all is ok false otherwise
 */
Mailer.prototype.use = function (connector) {
  // Search wanted mailer instance
  var founded = _.where(this.mailers, { name : connector });

  // Founded the wanted mailer instance ?
  if (!_.isEmpty(founded)) {
    // assign object to correct internal property
    this.mailer = _.first(founded);

    // Mailer founded use it !!
    this.logger.info([ '[ Mailer.use ] - selected instance',
                        connector,
                        'founded. Use it !' ].join(' '));

    // Default statement
    return true;
  }

  // log message
  this.logger.error([ '[ Mailer.use ] - Invalid instance name given.',
                      'Please use "nodemailer" or "mandrill"'
                    ].join(' '));

  // Default statement
  return false;
};

/**
 * Add a new recipient
 *
 * @param {String} email current email to add into list
 * @param {String} name current email name to add into list
 * @param {String} type current email type to add into list (to, cc, bcc)
 * @return {Boolean} return true on success, false otherwise
 */
Mailer.prototype.addRecipient = function (email, name, type) {
  // is Instanciate ?
  if (!this.isInstanciate()) {
    this.logger.error([ '[ Mailer.addRecipient ] - Cannot add recipiend.',
                        'Mailer instance is not defined.',
                        'Please choose you mailer instance by "use" method'
                 ].join(' '));
    return false;
  }

  // default statement
  return this.mailer.instance.addRecipient(email, name, type);
};

/**
 * Add a new CC recipient
 *
 * @param {String} email current email to add into list
 * @param {String} name current email name to add into list
 * @return {Boolean} return true on success, false otherwise
 */
Mailer.prototype.addCC = function (email, name) {
  return this.addRecipient(email, name, 'cc');
};

/**
 * Add a new BCC recipient
 *
 * @param {String} email current email to add into list
 * @param {String} name current email name to add into list
 * @return {Boolean} return true on success, false otherwise
 */
Mailer.prototype.addBCC = function (email, name) {
  return this.addRecipient(email, name, 'bcc');
};

/**
 * Set the expeditor.
 *
 * @method setExpeditor
 * @param {String} email email of the expeditor
 * @param {String} name current name of the expeditor
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.setExpeditor = function (email, name) {
  // is Instanciate ?
  if (!this.isInstanciate()) {
    this.logger.error([ '[ Mailer.setExpeditor ] - Cannot set expeditor.',
                        'Mailer instance is not defined.',
                        'Please choose you mailer instance by "use" method'
                     ].join(' '));
    return false;
  }

  // default statement
  return this.mailer.instance.setExpeditor(email, name);
};

/**
 * Wrap the setConfig method of selected mailer instance
 *
 * @method setConfig
 * @param {Mixed} config The configuration, for nodemailer config should be an Object, and a String for mandrill
 *
 * @return {Boolean|Object} return a promise object for async validaiton. For Mandril we validate the apikey directly on config usage
 */
Mailer.prototype.setConfig = function (config) {
  // save current context
  var context = this;

  // Return promise statement
  return new Promise(function (fulfill, reject) {
    // check if mailer is defined correctly
    if (!context.isInstanciate()) {
      var message = [ '[ Mailer.setConfig ] - mailer is not define,',
                      'Please define your mailer whith use method.' ].join(' ');
      // Dispach Message
      context.logger.error(message);
      // reject 
      reject(message);
    } else {
      // default statement
      context.mailer.instance.setConfig(config).then(function(success) {
        fulfill(success);
      }, function(error) {
        reject(error);
      });
    }
  });
};

/**
 * Wrap the send method of selected mailer. Implements promise to handle success and error
 *
 * @method send
 * @param {String} subject current subject of message
 * @param {String} message content of message in Html, text property was auto processed
 *
 * @return {Object} current promise to use
 * @example
 *  mailer.send('MY-SUBJECT', '<b>MY-HTML-MESSAGE</b>').then(function(success) {}, function(error) {});
 */
Mailer.prototype.send = function (subject, message) {
  // Save current context
  var context = this;

  // Return promise statement
  return new Promise(function (fulfill, reject) {
    // check if mail is ready to use
    if (false || !context.isInstanciate()) {
      var emessage =  [ '[ Mailer.send ] - mailer is not instanciate.',
                       'please configure your mailer before use send method.'
                     ].join(' ');
      // dispatch message
      context.logger.error(emessage);

      // reject
      reject(emessage);
    }

    // process send request
    context.mailer.instance.send(subject, message).then(function (response) {
      fulfill(response);
    } , function (error) {
      reject(error);
    });
  });
};

/**
 * Add an reply to to current mailer instance
 *
 * @method addReplyTo
 * @param {String} email email of the expeditor
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addReplyTo = function (email) {
  // is Instanciate ?
  if (!this.isInstanciate()) {
    this.logger.error([ '[ Mailer.addReplyTo ] - Cannot set expeditor.',
                        'Mailer instance is not defined.',
                        'Please choose you mailer instance by "use" method'
                     ].join(' '));
    return false;
  }

  // default statement
  return this.mailer.instance.addReplyTo(email);
};

/**
 * Get current instanciate state usage for mailer wrapper
 *
 * @return {Boolean} return true if is ready, false otherwise
 */
Mailer.prototype.isInstanciate = function () {
  // statement
  return !_.isEmpty(this.mailer) && !_.isUndefined(this.mailer.instance);
};

/**
* Export Mailer
*/
module.exports = new (Mailer)();
