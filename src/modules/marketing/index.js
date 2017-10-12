'use strict';

var _         = require('lodash');
var contact   = require('./contacts');
var campaigns = require('./campaigns');

/**
 * Main Marketing object.
 *
 * @param {Object} logger current logger instance
 */
function Marketing (logger) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Default contact instance
   */
  this.contact = contact(this.logger);

  /**
   * Default campagins instance
   */
  this.campaigns = campaigns(this.logger);
}

/**
 * Default export
 */
module.exports = Marketing;
