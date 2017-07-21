'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');

/**
 * Customer for current message object. In this some case we need to re-mapped
 * and customise property.
 *
 * @param {Object} logger default logger to use on current instance
 */
function Customiser (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * A transformer to change given value to the correct format for mandrill TO property
 *
 * @return {Object} object needed with given value
 */
Customiser.prototype.mandrillToFormat = function (key, value) {

  // defaut statement
  return _.map(value, function (v) {
    return {
      email : v.address,
      name  : v.name,
      type  : key
    };
  });
};

/**
 * A transformer to change given value to the correct format for IMPORTANT mandrill property
 *
 * @return {Object} object needed with given value
 */
Customiser.prototype.mandrillImportantFormat = function (key, value) {
  // default statement
  return value === 'high';
};

/**
 * A transformer to change given value to the correct format for mandrill attachements property
 *
 * @return {Object} object needed with given value
 */
Customiser.prototype.mandrillAttachementFormat = function (key, value) {

  // defaut statement
  return _.map(value, function (v) {
    return {
      content : v.content,
      name    : v.filename,
      type    : v.contentType
    };
  });
};

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ Customiser.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Customiser)(l);
};
