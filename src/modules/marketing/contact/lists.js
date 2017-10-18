'use strict';

var _ = require('lodash');
var Q = require('Q');

/**
 * Mail ContactList class
 *
 * @param {Object} logger current logger instance
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

ContactLists.prototype.list = function () {
  // default statement
  return this.sender.store({},
    this.sender.factory.MAILJET_TYPE).send('contactslist', 'get', 3, true);
};

ContactLists.prototype.viewByName = function (name) {
  // create an async process
  var deferred = Q.defer();

  // get list and fetch needed item
  this.list().then(function (success) {
    return deferred.resolve(_.compact(_.map(
    _.flatten(_.compact(_.map(JSON.parse(success.response.response.text), function (item) {
      return _.isArray(item) ? item : false;
    }))), function (item) {
      return _.get(item, 'Name') === name ? item : false;
    })));
  }).catch(function(error) {
    return deferred.reject(error);
  });

  // default statement
  return deferred.promise;
};

ContactLists.prototype.view = function (id) {
  // default statement
  return this.sender.store({
    'ID' : id
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'get', 3);
};

ContactLists.prototype.create = function (name) {
  // default statement
  return this.sender.store({
    'Name' : name
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'post', 3);
};

ContactLists.prototype.update = function (id, name) {
  // default statement
  return this.sender.store(_.omitBy({
    'ID' : id,
    'Name' : name
  }, function (item) {
    return _.isEmpty(item);
  }), this.sender.factory.MAILJET_TYPE).send('contactslist', 'put', 3);
};

ContactLists.prototype.delete = function (id) {
  // default statement
  return this.sender.store({
    'ID' : id
  }, this.sender.factory.MAILJET_TYPE).send('contactslist', 'delete', 3);
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
    logger.warning('[ ContactLists.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new ContactLists(l, sender);
};
