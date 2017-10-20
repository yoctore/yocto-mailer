'use strict';

var _             = require('lodash');
var contactLists  = require('./contact/lists');
var Q             = require('Q');
/**
 * Mail Contact class
 *
 * @param {Object} logger current logger instance
 */
function Contact (logger, sender) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Sender module to send data
   */
  this.sender = sender;

  /**
   * Default contact list instance
   */
  this.lists  = contactLists(this.logger, this.sender);
}

/**
 *
 */
Contact.prototype.create = function (email, fullname) {
  // default statement
  return this.sender.store({
    'Email' : email,
    'Name' : fullname,
  }, this.sender.factory.MAILJET_TYPE).send('contact', 'post', 3);
};

Contact.prototype.createAndAddToList = function (idList, email, fullname, properties) {
  // default statement
  return this.sender.store({
    'Email' : email,
    'Name' : fullname,
    'ID' : idList,
    'Action' : 'addnoforce'
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'post', 3, false, 'managecontact');
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Sender class to use on main process
 */
module.exports = function (l, sender) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Contact.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Contact(l, sender);
};
