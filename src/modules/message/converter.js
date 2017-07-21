'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');

/**
 * Process some verification test
 *
 * @param {Object} message current message to convert
 * @param {Object} logger default logger to use on current instance
 */
function Converter (message, logger) {
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
  this.customiser = require('./customiser')(this.logger);

  /**
   * sender module to send data
   */
  this.sender = require('./sender')(this.logger);

  /**
   * internal rules content
   */
  this.rules = require('./config/converter.json');
}

/**
 * Update current messsage
 *
 * @param {String} value current path to use on current process
 * @return {Object} current instance of converter to use chain process
 */
Converter.prototype.update = function (value) {
  // update current message
  this.message = value;
  // default statement
  return this;
};

/**
 * Return current message on a string representation
 *
 * @return {String} current message on string representation
 */
Converter.prototype.toString = function () {
  // default statement
  return JSON.stringify(this.message);
};

/**
 * Return current message for nodeMailer reprensentation
 *
 * @return {Object} current message on object representation
 */
Converter.prototype.toNodeMailer = function () {
  // default statement
  return this.convert(this.sender.NODEMAILER_TYPE);
};

/**
 * Return current message for mandrill reprensentation
 *
 * @return {Object} current message on object representation
 */
Converter.prototype.toMandrill = function () {
  // default statement
  return this.convert(this.sender.MANDRILL_TYPE);
};

/**
 * Process message convertion to defined format
 *
 * @param {String} key rule name to use for mapping
 * @return {Object} re-mapped message
 */
Converter.prototype.convert = function (key) {

  // we need first clone deep this current message
  var cloned = key === this.sender.NODEMAILER_TYPE ? this.message : {};

  // Try to get rules
  var rules = _.get(this.rules, key);

  // rules is array and not empty ?
  if (key !== this.sender.NODEMAILER_TYPE && _.isArray(rules) && !_.isEmpty(rules)) {
    // process maps
    _.map(rules, function (rule) {
      // try to get current value
      var value = !_.isFunction(this.customiser[rule.customiser]) ?
        _.get(this.message, rule.sourcePath) :
          this.customiser[rule.customiser](rule.sourcePath, _.get(this.message, rule.sourcePath));

      // this message already have value for this key ?
      if (_.has(cloned, rule.destinationPath)) {
        // get exists value
        var exists = _.get(cloned, rule.destinationPath);
        // try to process array and object case
        if (_.isArray(exists) || _.isObject(exists)) {
          // is array ?
          if (_.isArray(exists)) {
            // in this case apprend data to current array
            exists.push(value);
            // and flatten exists object to keep array to the correct format
            exists = _.flatten(exists);
          }

          // is object ?
          if (_.isObject(exists) && !_.isArray(exists)) {
            // in this case we try to merge data to replace it
            _.merge(exists, value);
          }
        } else {
          // in all other case we replace exits value with current
          exists = value;
        }
        // and assign new value
        value = exists;
      }

      // set value on if is not undefined
      if (!_.isUndefined(value)) {
        // set value
        _.set(cloned, rule.destinationPath, value);
      }
    }.bind(this));
  } else {
    // log a warning message
    this.logger.warning([ '[ Converter.convert ] - cannot process convertion to [', key,
      '] format. Rules are not defined or is empty' ].join(' '));
  }

  // default statement
  return _.isEmpty(cloned) ? false : this.sender.store(cloned, key);
};

/**
 * Default export
 */
module.exports = function (message, l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ Converter.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Converter)(message, l);
};
