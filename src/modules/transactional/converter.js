'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var customiser  = require('./customiser');
var sender      = require('../sender');
var fs          = require('fs');
var path        = require('path');

/**
 * Process some verification test
 *
 * @param {Object} message current message to convert
 * @param {Object} logger default logger to use on current instance
 */
function Converter (message, logger, options) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Default message to convert
   */
  this.message = message;

  /**
   * Customier module to transform data
   */
  this.customiser = customiser(this.logger);

  /**
   * Sender module to send data
   */
  this.sender = sender(this.logger, options);

  /**
   * Internal rules content
   */
  this.rules = JSON.parse(fs.readFileSync(path.resolve([
    __dirname, './config/converter.json'
  ].join('/'))));
}

/**
 * Update current messsage
 *
 * @param {String} value current path to use on current process
 * @return {Object} current instance of converter to use chain process
 */
Converter.prototype.update = function (value) {
  // Update current message
  this.message = value;

  // Default statement
  return this;
};

/**
 * Return current message on a string representation
 *
 * @return {String} current message on string representation
 */
Converter.prototype.toString = function () {
  // Default statement
  return JSON.stringify(this.message);
};

/**
 * Return current message for nodeMailer reprensentation
 *
 * @return {Object} current message on object representation
 */
Converter.prototype.toNodeMailer = function () {
  // Default statement
  return this.convert(this.sender.factory.NODEMAILER_TYPE);
};

/**
 * Return current message for mandrill reprensentation
 *
 * @return {Object} current message on object representation
 */
Converter.prototype.toMandrill = function () {
  // Default statement
  return this.convert(this.sender.factory.MANDRILL_TYPE);
};

/**
 * Return current message for mailjet reprensentation
 *
 * @return {Object} current message on object representation
 */
Converter.prototype.toMailjet = function () {
  // Default statement
  return this.convert(this.sender.factory.MAILJET_TYPE);
};

/**
 * Process message convertion to defined format
 *
 * @param {String} key rule name to use for mapping
 * @return {Object} re-mapped message
 */
Converter.prototype.convert = function (key) {
  // We need first clone deep this current message
  var cloned = key === this.sender.factory.NODEMAILER_TYPE ? this.message : {};

  // Try to get rules
  var rules = _.get(this.rules, key);

  // Rules is array and not empty ?
  if (key !== this.sender.factory.NODEMAILER_TYPE && !_.isEmpty(rules) &&
    _.has(rules, 'prerules') && _.isArray(rules.prerules) ) {
    // Process maps
    _.map(rules.prerules, function (rule) {
      // Try to get current value
      var value = !_.isFunction(this.customiser[rule.customiser]) ?
        _.get(this.message, rule.sourcePath) :
        this.customiser[rule.customiser](rule.sourcePath, _.get(this.message, rule.sourcePath));

      // This message already have value for this key ?
      if (_.has(cloned, rule.destinationPath)) {
        // Get exists value
        var exists = _.get(cloned, rule.destinationPath);

        // Try to process array and object case
        if (_.isArray(exists) || _.isObject(exists)) {
          // Is array ?
          if (_.isArray(exists)) {
            // In this case apprend data to current array
            exists.push(value);

            // And flatten exists object to keep array to the correct format
            exists = _.flatten(exists);
          }

          // Is object ?
          if (_.isObject(exists) && !_.isArray(exists)) {
            // In this case we try to merge data to replace it
            _.merge(exists, value);
          }
        } else {
          // In all other case we replace exits value with current
          exists = value;
        }

        // And assign new value
        value = exists;
      }

      // Set value on if is not undefined
      if (!_.isUndefined(value)) {
        // Set value
        _.set(cloned, rule.destinationPath, value);
      }
    }.bind(this));

    // has post rules ?
    if (_.has(rules, 'postrules')) {
      // parse postrules
      _.map(rules.postrules, function (rule) {
        // Try to get current value
        if (_.isFunction(this.customiser[rule.customiser])) {
          cloned = this.customiser[rule.customiser](cloned);
        }
      }.bind(this));
    }
  } else {
    // Is not not mailer ?
    if (key !== this.sender.factory.NODEMAILER_TYPE) {
      // Log a warning message
      this.logger.warning([ '[ Converter.convert ] - cannot process convertion to [', key,
        '] format. Rules are not defined or is empty' ].join(' '));
    }
  }

  // Default statement
  return this.sender.store(cloned, key);
};

/**
 * Default export
 *
 * @param {Object} message current messae object to convert 
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Converter class to use on main process
 */
module.exports = function (message, l, options) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Converter.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Converter(message, l, options);
};
