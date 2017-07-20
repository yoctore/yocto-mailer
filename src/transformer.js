'use strict';

var logger      = require('yocto-logger');
var _           = require('lodash');
var joi         = require('joi');
var striptags   = require('striptags');
var path        = require('path');
var fs          = require('fs');
var mime        = require('mime');

/**
 * Default schema validator class
 *
 * @param {Object} logger default logger to use on current instance
 */
function Transformer(logger) {
  /**
   * Default logger
   */
   this.logger = logger;
}

/**
 * A transformer to change given value to correct format for to,from,cc,bcc property
 *
 * @return {Object} object needed with given value
 */
Transformer.prototype.toAddressObject = function (value) {
  // default statement
  return _.isString(value) ? {
    address : value,
    name    : value
  } : value;
};

/**
 * A transformer to change given value to an address array 
 *
 * @return {Array} array need with given value
 */
Transformer.prototype.toAddressArray = function (value) {
  // default statement
  return this.toArray(this.toAddressObject(value));
};

/**
 * A transformer to change given value to an array
 *
 * @return {Array} array need with given value
 */
Transformer.prototype.toArray = function (value) {
  // default statement
  return [ value ];
};

/**
 * A transformer to change given html string to an non html string
 *
 * @return {Array} array need with given value
 */
Transformer.prototype.htmlToText = function (value) {
  // default statement
  return striptags(value);
};

/**
 * A transformer to change given attachements to the correct format
 *
 * @return {Array} array need with given attachements
 */
Transformer.prototype.attachementsToArray = function (value) {
  // default statement
  return this.toArray({
    filename      : path.basename(value),
    content       : fs.readFileSync(value).toString('base64'),
    contentType   : mime.lookup(value),
    encoding      : 'base64'
  });
};

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ Transformer.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Transformer)(l);
};