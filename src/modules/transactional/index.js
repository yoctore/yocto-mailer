'use strict';

var _           = require('lodash');
var uuid        = require('uuid');
var schema      = require('./schema');
var checker     = require('./checker');
var converter   = require('./converter');
var transformer = require('./transformer');

/**
 * Main message object
 *
 * @param {Object} logger current logger instance
 * @param {Object} options custom option to use on message
 */
function Message (logger, options) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Default message
   */
  this.message = {};

  /**
   * Default schema validator
   */
  this.schema = schema(this.logger);

  /**
   * Default transformer module
   */
  this.transformers = transformer(this.logger);

  /**
   * Default checker module
   */
  this.checker = checker(this.logger);

  /**
   * Default checker module
   */
  this.converter = converter(this.message, this.logger, options);
}

/**
 * Set given value to given key, if transformers is given the value is transform before assign
 *
 * @param {String} key property value to use on current message
 * @param {Mixed} value value to use with current key on current message
 * @param {String} transformer if this value is given, we use this value
 * @param {String} checker rule to use on checker
 * @return {Boolean} true in case of success false otherwise
 */
Message.prototype.set = function (key, value, transformer, checker) {
  // Validate schema first
  value = this.schema.validate(key, value);

  // If valid ?
  if (value !== false) {
    // Checker is given ?
    if (_.isFunction(this.checker[checker])) {
      // Alternative invalid statement
      if (!this.checker[checker](value)) {
        // If we here we can continue
        return false;
      }
    }

    // Transformers is given ?
    if (_.isFunction(this.transformers[transformer])) {
      // Alternative invalid statement
      transformer = this.transformers[transformer](value);
    }

    // Default valid statement
    return this.addKey(key, transformer || value);
  }

  // Default statement
  return false;
};

/**
 * Main process to add directly the given key with the given value
 *
 * @param {String} key property value to use on current message
 * @param {Mixed} value value to use with current key on current message
 * @return {Boolean} true in case of success false otherwise
 */
Message.prototype.addKey = function (key, value) {
  // This message already have value for this key ?
  if (_.has(this.message, key)) {
    // Get exists value
    var exists = _.get(this.message, key);

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

  // Set value
  _.set(this.message, key, value);

  // And return if value if correctly append
  return _.has(this.message, key);
};

/**
 * Set from value for current message object
 *
 * @param {String|Object} value from value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setFrom = function (value) {
  // Defaut statement
  return this.set('from', value, 'toAddressObject');
};

/**
 * Add a TO value for current message object
 *
 * @param {String|Object} value to value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.addTo = function (value) {
  // Defaut statement
  return this.set('to', value, 'toAddressArray');
};

/**
 * Add a CC value for current message object
 *
 * @param {String|Object} value cc value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.addCC = function (value) {
  // Defaut statement
  return this.set('cc', value, 'toAddressArray');
};

/**
 * Add a BCC value for current message object
 *
 * @param {String|Object} value bcc value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.addBCC = function (value) {
  // Defaut statement
  return this.set('bcc', value, 'toAddressArray');
};

/**
 * Set Subject value for current message object
 *
 * @param {String} value subject value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setSubject = function (value) {
  // Defaut statement
  return this.set('subject', value);
};

/**
 * Set Message value for current message object
 *
 * @param {String} value html/text value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setMessage = function (value) {
  // Defaut statement
  return this.set('html', value) && this.set('text', value, 'htmlToText');
};

/**
 * Add an attachement for current message object
 *
 * @param {String} value path value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.addAttachment = function (value) {
  // Defaut statement
  return this.set('attachments', value, 'attachementsToArray', 'isFile');
};

/**
 * Add an alternative content for current message object
 *
 * @param {String} value path value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.addAlternative = function (value) {
  // Defaut statement
  return this.set('alternatives', value, 'attachementsToArray', 'isFile');
};

/**
 * Add a replyTo address for current message object
 *
 * @param {String} value replyTo address value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setReplyTo = function (value) {
  // Defaut statement
  return this.set('replyTo', value) && this.set('inReplyTo', uuid.v4());
};

/**
 * Set a specific header for current message object
 *
 * @param {Object} value header value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setHeader = function (value) {
  // Defaut statement
  return this.set('headers', value, 'toHeaderObject');
};

/**
 * Set a delivery priority for current message object
 *
 * @param {String} value delivery value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setPriority = function (value) {
  // Defaut statement
  return this.set('priority', value);
};

/**
 * Set a delivery priority to high for current message object
 *
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setPriorityToHigh = function () {
  // Defaut statement
  return this.set('priority', 'high');
};

/**
 * Set a delivery priority to low for current message object
 *
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setPriorityToLow = function () {
  // Defaut statement
  return this.set('priority', 'low');
};

/**
 * Set a delivery priority to normal for current message object
 *
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setPriorityToNormal = function () {
  // Defaut statement
  return this.set('priority', 'normal');
};

/**
 * Do all last needed operation for current message object
 *
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.prepareLastOperations = function () {
  // Set last need opration need value
  // last header for message id
  // and the date of message. For security reason this value can not be override
  return this.setHeader({
    key   : 'messageId',
    value : uuid.v4()
  }) && this.set('date');
};

/**
 * This method build a message on raw mode. In this case you need to build your request object
 * before send you must follow the specs of each module impleted.
 *
 * @param {Object} value your object message builded
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.raw = function (value) {
  // Set message
  _.merge(this.message, value);

  // Default statement
  return true;
};

/**
 * Get the current prepared message
 *
 * @return {Object} true in case of success
 */
Message.prototype.prepare = function () {
  // Do last operation
  this.prepareLastOperations();

  // Set current message to be immutable
  Object.freeze(this.message);

  // Default statement
  return this.converter.update(this.message);
};

/** ****************************************************************************************
 * From here we are in specific mandrill wrapper method
 ******************************************************************************************/

/**
 * Set a subaccount for current message object (Specific Mandrill)
 *
 * @param {String} value subaccount value for current object
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.setSubAccount = function (value) {
  // Defaut statement
  return this.set('subaccount', value);
};


/** ****************************************************************************************
 * From here we are in utility method
 ******************************************************************************************/

/**
 * Set a sandbox flag for current message object (Specific Mailjet or for sandbox all your request)
 *
 * @param {Boolean} localOnly if true all requests will response success, otherwise keep the normal sandbox process (only for mailjet transactional)
 * @return {Boolean} true in case of success, false otherwise
 */
Message.prototype.enableSandbox = function (localOnly) {
  // LocalOnly is needed
  if (localOnly) {
    this.set('localSandbox', true);
  }

  // Defaut statement
  return this.set('sandbox', true);
};


/**
 * Default export
 */
module.exports = Message;
