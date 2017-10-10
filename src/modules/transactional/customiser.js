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

/******************************************************************************************
 * Mandrill customiser part. Do not defined other provider method is this block please !
 ******************************************************************************************/

/**
 * A transformer to change given value to the correct format for mandrill TO property
 *
 * @param {String} key current key to use for current customiser
 * @param {Mixed} value data to use for current customiser
 * @return {Object} object needed with given value
 */
Customiser.prototype.mandrillToFormat = function (key, value) {
  // Defaut statement
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
 * @param {String} key current key to use for current customiser
 * @param {Mixed} value data to use for current customiser
 * @return {Object} object needed with given value
 */
Customiser.prototype.mandrillImportantFormat = function (key, value) {
  // Default statement
  return value === 'high';
};

/**
 * A transformer to change given value to the correct format for mandrill attachements property
 *
 * @param {String} key current key to use for current customiser
 * @param {Mixed} value data to use for current customiser
 * @return {Object} object needed with given value
 */
Customiser.prototype.mandrillAttachementFormat = function (key, value) {
  // Defaut statement
  return _.map(value, function (v) {
    return {
      content : v.content,
      name    : v.filename,
      type    : v.contentType
    };
  });
};

/******************************************************************************************
 * mailjet customiser part. Do not defined other provider method is this block please !
 ******************************************************************************************/

/**
 * A transformer to change given value to the correct format for mailjet From property
 *
 * @param {String} key current key to use for current customiser
 * @param {Mixed} value data to use for current customiser
 * @return {Object} object needed with given value
 */
Customiser.prototype.mailjetFromToCcBccFormat = function (key, value) {
  // Defaut statement
  return _.isArray(value) ? _.map(value, function (v) {
    return {
      'Email' : v.address,
      'Name'  : v.name 
    };
  }) : {
    'Email' : value.address,
    'Name'  : value.name
  };
};

/**
 * A transformer to change given value to the correct format for mailjet attachements property
 *
 * @param {String} key current key to use for current customiser
 * @param {Mixed} value data to use for current customiser
 * @return {Object} object needed with given value
 */
Customiser.prototype.mailjetAttachementFormat = function (key, value) {
  // Defaut statement
  return _.map(value, function (v) {
    return {
      'Base64Content' : v.content,
      'Filename'      : v.filename,
      'ContentType'   : v.contentType
    };
  });
};

/**
 * A transformer to change given value to the correct format for IMPORTANT mailjet property
 *
 * @param {String} key current key to use for current customiser
 * @param {Mixed} value data to use for current customiser
 * @return {Object} object needed with given value
 */
Customiser.prototype.mailjetImportantFormat = function (key, value) {
  // Default statement
  return _.get({
    'low'   : 0,
    'high'  : 2
  }, value) || 2;
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Checker class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Customiser.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Customiser(l);
};
