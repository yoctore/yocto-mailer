'use strict';

var _ = require('lodash');
var Q = require('q');

/**
 * Mail ContactList class
 *
 * @param {Object} logger current logger instance
 * @param {Object} sender default sender instance to use
 */
function ContactLists (logger, sender) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Sender module to send data
   */
  this.sender = sender;
}

/**
 * List all existing list from mailjet account
 *
 * @return {Promise} a promise to catch
 */
ContactLists.prototype.list = function () {
  // Default statement
  return this.sender.store({},
    this.sender.factory.MAILJET_TYPE).send('contactslist', 'get', 3, true);
};

/**
 * Get an a list by his name
 *
 * @param {String} name name to find on list
 * @return {Promise} a promise to catch
 */
ContactLists.prototype.viewByName = function (name) {
  // Create an async process
  var deferred = Q.defer();

  // Get list and fetch needed item
  this.list().then(function (success) {
    return deferred.resolve(_.compact(_.map(
      _.flatten(_.compact(_.map(JSON.parse(success.response.response.text), function (item) {
        return _.isArray(item) ? item : false;
      }))), function (item) {
        return _.get(item, 'Name') === name ? item : false;
      })));
  }).catch(function (error) {
    return deferred.reject(error);
  });

  // Default statement
  return deferred.promise;
};

/**
 * View details of a list givent by his id
 *
 * @param {String} id id to find on list
 * @return {Promise} a promise to catch
 */
ContactLists.prototype.view = function (id) {
  // Default statement
  return this.sender.store({
    ID : id
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'get', 3);
};

/**
 * Create a list with given name
 *
 * @param {String} name name of the list to create
 * @return {Promise} a promise to catch
 */
ContactLists.prototype.create = function (name) {
  // Default statement
  return this.sender.store({
    Name : name
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'post', 3);
};

/**
 * Update a list by id
 *
 * @param {String} id identifier to use for update
 * @param {String} name name to update on list request
 * @return {Promise} a promise to catch
 */
ContactLists.prototype.update = function (id, name) {
  // Default statement
  return this.sender.store(_.omitBy({
    ID   : id,
    Name : name
  }, function (item) {
    return _.isEmpty(item);
  }), this.sender.factory.MAILJET_TYPE).send('contactslist', 'put', 3);
};

/**
 * Delete a list by id
 *
 * @param {String} id identifier to use for delete
 * @return {Promise} a promise to catch
 */
ContactLists.prototype.delete = function (id) {
  // Default statement
  return this.sender.store({
    ID : id
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'delete', 3);
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
    logger.warning('[ ContactLists.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new ContactLists(l, sender);
};
