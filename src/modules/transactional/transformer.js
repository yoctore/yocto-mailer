'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var striptags   = require('striptags');
var path        = require('path');
var fs          = require('fs');
var mime        = require('mime');
var uuid        = require('uuid');

/**
 * Default schema validator class
 *
 * @param {Object} logger default logger to use on current instance
 */
function Transformer (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

/**
 * A transformer to change given value to correct format for to,from,cc,bcc property
 *
 * @param {String|Object} value object to bind and use on return object
 * @return {Object} object needed with given value
 */
Transformer.prototype.toAddressObject = function (value) {
  // Default statement
  return _.isString(value) ? {
    address : value,
    name    : value
  } : value;
};

/**
 * A transformer to change given value to an address array
 *
 * @param {Object} value object to bind and use on return object
 * @return {Array} array need with given value
 */
Transformer.prototype.toAddressArray = function (value) {
  // Default statement
  return this.toArray(this.toAddressObject(value));
};

/**
 * A transformer to change given value to an array
 *
 * @param {Mixed} value object to bind and use on return object
 * @return {Array} array need with given value
 */
Transformer.prototype.toArray = function (value) {
  // Default statement
  return [ value ];
};

/**
 * A transformer to change given html string to an non html string
 *
 * @param {String} value string to use for striptags process
 * @return {Array} array need with given value
 */
Transformer.prototype.htmlToText = function (value) {
  // Default statement
  return striptags(value);
};

/**
 * A transformer to change given attachements to the correct format
 *
 * @param {Object} value object to bind and use on return object
 * @return {Array} array need with given attachements
 */
Transformer.prototype.attachementsToArray = function (value) {
  // Default statement
  return this.toArray({
    cid         : uuid.v4(),
    content     : fs.readFileSync(value).toString('base64'),
    contentType : mime.getType(value),
    encoding    : 'base64',
    filename    : path.basename(value)
  });
};

/**
 * A transformer to change given value to correct format object for headers properties
 *
 * @param {Object} value object to bind and use on return object
 * @return {Object} object needed with given value
 */
Transformer.prototype.toHeaderObject = function (value) {
  // Default statement
  return _.set({}, value.key, value.value);
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Transformer class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Transformer.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Transformer(l);
};
