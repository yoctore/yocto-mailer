'use strict';

var logger  = require('yocto-logger');
var _       = require('lodash');
var joi     = require('joi');
var moment  = require('moment');

/**
 * Default schema validator class
 *
 * @param {Object} logger default logger to use on current instance
 */
function SchemaValidator (logger) {
  /**
   * Default logger
   */
  this.logger = logger;

  /**
   * Default schema list
   */
  this.schemas = {
    // default from schema for from
    'from'          : joi.alternatives().try(
      joi.object().required().keys({
        address : joi.string().email().required().empty(),
        name    : joi.string().optional().default(joi.ref('address'))
      }),
      joi.string().email().required().empty()
    ),
    'to'            : joi.alternatives().try(
      joi.object().required().keys({
        address : joi.string().email().required().empty(),
        name    : joi.string().optional().default(joi.ref('address'))
      }),
      joi.string().email().required().empty()
    ),
    'cc'            : joi.alternatives().try(
      joi.object().required().keys({
        address : joi.string().email().required().empty(),
        name    : joi.string().optional().default(joi.ref('address'))
      }),
      joi.string().email().required().empty()
    ),
    'bcc'           : joi.alternatives().try(
      joi.object().required().keys({
        address : joi.string().email().required().empty(),
        name    : joi.string().optional().default(joi.ref('address'))
      }),
      joi.string().email().required().empty()
    ),
    'subject'       : joi.string().required().empty(),
    'html'          : joi.string().required().empty(),
    'text'          : joi.string().required().empty(),
    'attachments'   : joi.string().required().empty(),
    'alternatives'  : joi.string().required().empty(),
    'replyTo'       : joi.string().email().required().empty(),
    'inReplyTo'     : joi.string().required().empty(),
    'priority'      : joi.string().required().valid([ 'low', 'normal', 'high' ]),
    'headers'       : joi.object().required().keys({
      key     : joi.string().required().empty(),
      value   : joi.string().required().empty()
    }),
    'date'          : joi.date().optional().min('now').max('now').default(moment().toString()),
    // Specific Mandrill schema
    'subaccount'    : joi.string().required().empty()
  };
}

/**
 * Try to get current needed schama rule for validation process
 *
 * @param {String} name key name to use
 * @return {Object|Boolean} an object in case of success, false otherwise
 */
SchemaValidator.prototype.get = function (name) {
  // so try to get it or return false
  return _.has(this.schemas, name) ? _.get(this.schemas, name) : false;
};

/**
 * Validate given value from given rules
 *
 * @param {String} name key name to use for get method
 * @param {Mixed} value value to use on validator
 * @return {Object|Boolean} true is case of success, false otherwise
 */
SchemaValidator.prototype.validate = function (name, value) {
  // try to get schema
  var schema = this.get(name);
  // try to get schemas
  if (!_.isBoolean(schema)) {
    // if we are here we need to apply validation
    var result = joi.validate(value, schema);

    // has no error ?
    if (_.isNull(result.error)) {
      // return valid statement
      return result.value;
    }

    // if we are here we must log the error because process is invalid
    this.logger.warning([ '[ SchemaValidator.validate ] - Cannot validate schema for given name [',
      name, ']. Error is : ', result.error ].join(' '));
  } else {
    // if we are here someting were wrong so log it
    this.logger.warning([ '[ SchemaValidator.validate ] - No schema was founded for given name : [',
      name, ']' ].join(' '));
  }

  // default statement
  return false;
};

/**
 * Default export
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log a warning message
    logger.warning('[ SchemaValidator.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (SchemaValidator)(l);
};
