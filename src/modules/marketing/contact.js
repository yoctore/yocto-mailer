'use strict';

var _ = require('lodash');

/**
 * Mail Contact class
 *
 * @param {Object} logger current logger instance
 */
function Contact (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
  
  this.lists    = [];
  this.contacts = [];
}

Contact.prototype.createLists = function (name) {
  if (!_.isEmpty(name)) {
    this.lists.push(name);
  }
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Sender class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Contact.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Contact(l);
};