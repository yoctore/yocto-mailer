'use strict';

var contact   = require('./contacts');
var sender    = require('../sender');

/**
 * Main Marketing object.
 *
 * @param {Object} logger current logger instance
 * @param {Object} options custom option to use on message
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
