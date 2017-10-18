'use strict';

var _         = require('lodash');
var contact   = require('./contacts');
var campaigns = require('./campaigns');
var sender    = require('../sender');

/**
 * Main Marketing object.
 *
 * @param {Object} logger current logger instance
 */
function Marketing (logger, options) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Sender module to send data
   */
  this.sender = sender(this.logger, options);

  /**
   * Default contact instance
   */
  this.contact = contact(this.logger, this.sender);
}

/**
 * Default export
 */
module.exports = Marketing;
