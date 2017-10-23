'use strict';

var _             = require('lodash');
var contactLists  = require('./contact/lists');

/**
 * Mail Contact class
 *
 * @param {Object} logger current logger instance
 * @param {Object} sender main sender classe to use
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
  this.lists = contactLists(this.logger, this.sender);

  /**
   * Default type DataType
   */
  this.DATATYPE_STR = 'str';
  this.DATATYPE_INT = 'int';
  this.DATATYPE_FLOAT = 'float';
  this.DATATYPE_BOOL = 'bool';

  /**
   * Default type for NameSpace
   */
  this.DATATYPE_NAMESPACE_STATIC = 'static';
  this.DATATYPE_NAMESPACE_HYSTORIC = 'historic';

  this.ACTION_ADD_NO_FORCE = 'addnoforce';
  this.ACTION_REMOVE = 'remove';
  this.ACTION_UNSUBSCRIBE = 'unsub';
}

/**
 * Create a contact
 *
 * @param {String} email email to use
 * @param {String} fullname compte name to use
 * @return {Promise} promise to catch
 */
Contact.prototype.create = function (email, fullname) {
  // Default statement
  return this.sender.store({
    Email : email,
    Name  : fullname
  }, this.sender.factory.MAILJET_TYPE).send('contact', 'post', 3);
};

Contact.prototype.createAndAddToList = function (idList, email, fullname, properties, action) {
  // Default statement
  return this.sender.store(_.omitBy({
    Email      : email,
    Name       : fullname,
    ID         : idList,
    Action     : action || 'addnoforce',
    Properties : properties || {}
  }, function (item) {
    return _.isNull(item) || _.isEmpty(item) || _.isEmpty(item)
  }), this.sender.factory.MAILJET_TYPE).send('contactslist', 'post', 3, false, 'managecontact');
};

/**
 * Unsubscribe a contact
 *
 * @param {String} idList list identifier to use for action
 * @param {String} email email to use
 * @return {Promise} promise to catch
 */
Contact.prototype.unsubscribe = function (idList, email) {
  // Default statement
  return this.createAndAddToList(idList, email, null, null, this.ACTION_UNSUBSCRIBE);
};

/**
 * Remove a contact
 *
 * @param {String} idList list identifier to use for action
 * @param {String} email email to use
 * @return {Promise} promise to catch
 */
Contact.prototype.remove = function (idList, email) {
  // Default statement
  return this.createAndAddToList(idList, email, null, null, this.ACTION_REMOVE);
};

/**
 * Add custom property to contact
 *
 * @param {String} name name of property
 * @param {String} type type of property
 * @return {Promise} promise to catch
 */
Contact.prototype.addCustomProperties = function (name, type) {
  // Default statement
  return this.sender.store({
    Datatype  : type || this.DATATYPE_STR,
    Name      : name,
    NameSpace : this.DATATYPE_NAMESPACE_STATIC
  }, this.sender.factory.MAILJET_TYPE).send('contactmetadata', 'post', 3);
};

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @param {Object} sender main sender class to use on main process
 *
 * @return {Object} current instance
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
