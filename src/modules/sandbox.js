'use strict';

var   _ = require('lodash');
var Q = require('q');

/**
 * Default Sandbow wrapper to change response of transporter send/sync method
 *
 * @param {Object} logger default logger to use on current instance
 */
function Sandbox (logger) {
  /**
   * Default logger
   */
  this.logger = logger;
}

Sandbox.prototype.check = function (transport, message) {
  // get sandbox mode
  var state = _.get(message, 'localSandbox') || false;

  // sandbox mode id enabled ?
  if (state) {
    // log a warning message
    this.logger.warning('[ Sandbox.check ] - Sandbox is requested, full sandbox is enabled');

    // now transfort send method to return a success all the time
    transport.send = function () {
      // Create deferred process
      var deferred = Q.defer();
    
      // Default verify process
      if (true) {
        // On the other case we resolve the promise
        deferred.resolve({
          mode    : 'sandbox',
          message : 'All is ok. Test it on remote sandbox or in real mode'
        });
      }

      // Default statement
      return deferred.promise;
    }
  }
  
  // default statement
  return transport;
}

/**
 * Default export
 *
 * @param {Object} l logger instance to use on main module
 * @return {Object} main Factory class to use on main process
 */
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // Log a warning message
    logger.warning('[ Sandbox.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Sandbox(l);
};