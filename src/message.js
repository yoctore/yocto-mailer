'use strict';

var joi     = require('joi');
var _       = require('lodash');


function Message () {
  /**
   * Default message
   */
  this.message        = {};
  /**
   * Default schema validator
   */
  this.schema         = require('./schema')();
  /**
   * Default transformer module
   */
  this.transformers   = require('./transformer')();
  /**
   * Default checker module
   */
  this.checker        = require('./checker')();
}

/**
 * Set given value to given key, if transformers is given the value is transform before assign
 *
 * @param {String} key property value to use on current message
 * @param {Mixed} value value to use with current key on current message
 * @param {String} transformers if this value is given, we use this value
 * @return {Boolean} true in case of success false otherwise
 */
Message.prototype.set = function (key, value, transformer, checker) {
  // validate schema first
  if (this.schema.validate(key, value)) {
    // checker is given ?
    if (_.isFunction(this.checker[checker])) {
      // alternative invalid statement
      if (!this.checker[checker](value)) {
        // if we here we can continue
        return false;
      }
    }

    // transformers is given ?
    if (_.isFunction(this.transformers[transformer])) {
      // alternative invalid statement
      transformer = this.transformers[transformer](value);
    }

    // default valid statement
    return this.addKey(key, transformer || value);
  }

  // default statement
  return false;
};

Message.prototype.addKey = function (key, value) {
  // this message already have value for this key ?
  if (_.has(this.message, key)) {
    // get exists value
    var exists = _.get(this.message, key);
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
  // set value
  _.set(this.message, key, value);

  // and return if value if correctly append
  return _.has(this.message, key);
};

/**
 * Set from value for current message object
 *
 * @param value from value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.setFrom = function (value) {
  // defaut statement
  return this.set('from', value, 'toAddressObject');
};

/**
 * Add a TO value for current message object
 *
 * @param value to value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.addTo = function (value) {
  // defaut statement
  return this.set('to', value, 'toAddressArray');
};

/**
 * Add a CC value for current message object
 *
 * @param value cc value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.addCC = function (value) {
  // defaut statement
  return this.set('cc', value, 'toAddressArray');
};

/**
 * Add a BCC value for current message object
 *
 * @param value bcc value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.addBCC = function (value) {
  // defaut statement
  return this.set('bcc', value, 'toAddressArray');
};

/**
 * Set Subject value for current message object
 *
 * @param value subject value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.setSubject = function (value) {
  // defaut statement
  return this.set('subject', value);
};

/**
 * Set Message value for current message object
 *
 * @param value html/text value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.setMessage = function (value) {
  // defaut statement
  return this.set('html', value) && this.set('text', value, 'htmlToText');
};

/**
 * Add an attachement for current message object
 *
 * @param value path value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.addAttachement = function (value) {
  // defaut statement
  return this.set('attachements', value, 'attachementsToArray', 'isFile');
};

/**
 * Add an alternative content for current message object
 *
 * @param value path value for current object
 * @return {Boolean} true in case of success
 */
Message.prototype.addAlternative = function (value) {
  // defaut statement
  return this.set('alternatives', value, 'attachementsToArray', 'isFile');
};

var m = new Message();
m.setFrom('test@test.com');
//m.setFrom({ address : 'from@from.com', name : 'from' });
m.addTo({ address : 'to111111@to.com', name : 'to' });
m.addTo('to2222@to.com');
m.addCC({ address : 'cc1@test.com', name : 'cc1' });
m.addCC('cc2@test.com');
m.addBCC({ address : 'bcc1@test.com', name : 'bcc1' });
m.addBCC('bcc2@test.com');
m.setSubject('My subject');
m.setMessage('<b>My subject</b>');
m.addAttachement('./README.md');
m.addAlternative('./Gruntfile.js');
console.log(m.message);