'use strict';

var logger      = require('yocto-logger');
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
 * @date : 17/09/2015
 * @author : Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @class Mailer
 */
function Mailer (logger) {
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
      instance  : require('./modules/nodemailer')(logger),
      name      : 'nodemailer',

    },
    // mandrill definition
    {
      instance    : require('./modules/mandrill')(logger),
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
 * Enable complete clean before new send for current mailer instance
 *
 * @return {Boolean} true if enable succeed false otherwise
 */
Mailer.prototype.enableCompleteClean = function () {
  // is Instanciate ?
  if (!this.isInstanciate()) {
    this.logger.error([ '[ Mailer.enableCompleteClean ] - Cannot enable complete clean function.',
                        'Mailer instance is not defined.',
                        'Please choose you mailer instance by "use" method'
                 ].join(' '));
    return false;
  }

  // default statement
  return this.mailer.instance.processCompleteClean(true);
};

/**
 * Disable complete clean before new send for current mailer instance
 *
 * @return {Boolean} true if enable succeed false otherwise
 */
Mailer.prototype.disableCompleteClean = function () {
  // is Instanciate ?
  if (!this.isInstanciate()) {
    this.logger.error([ '[ Mailer.disableCompleteClean ] - Cannot disable complete clean function.',
                        'Mailer instance is not defined.',
                        'Please choose you mailer instance by "use" method'
                 ].join(' '));
    return false;
  }

  // default statement
  return this.mailer.instance.processCompleteClean(false);
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
  // Return promise statement
  return new Promise(function (fulfill, reject) {
    // check if mailer is defined correctly
    if (!this.isInstanciate()) {
      var message = [ '[ Mailer.setConfig ] - mailer is not define,',
                      'Please define your mailer whith use method.' ].join(' ');
      // Dispach Message
      this.logger.error(message);
      // reject
      reject(message);
    } else {
      // default statement
      this.mailer.instance.setConfig(config).then(function (success) {
        fulfill(success);
      }, function (error) {
        reject(error);
      });
    }
  }.bind(this));
};

/**
 * Wrap the send method of selected mailer. Implements promise to handle success and error
 *
 * @method send
 * @param {String} subject current subject of message
 * @param {String} message content of message in Html, text property was auto processed
 * @param {String} subaccount subaccount to use on send
 *
 * @return {Object} current promise to use
 */
Mailer.prototype.send = function (subject, message, subaccount) {
  // Return promise statement
  return new Promise(function (fulfill, reject) {
    // check if mail is ready to use
    if (!this.isInstanciate()) {
      var emessage =  [ '[ Mailer.send ] - mailer is not instanciate.',
                       'please configure your mailer before use send method.'
                     ].join(' ');
      // dispatch message
      this.logger.error(emessage);

      // reject
      reject(emessage);
    }

    // build default arfs
    var args = [subject, message];

    // subaccount is defined ?
    if (_.isString(subaccount)) {
      // push it
      args.push(subaccount);
    }

    // process send request
    this.mailer.instance.send.apply(this.mailer.instance, args).then(function (response) {
      fulfill(response);
    } , function (error) {
      reject(error);
    });
  }.bind(this));
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
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Mailer.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Mailer)(l);
};
