'use strict';

var nodemailer      = require("nodemailer");
var smtpTransport   = require('nodemailer-smtp-transport');
var logger          = require('yocto-logger');
var _               = require('lodash');
var Joi             = require('joi');

/**
 * Yocto Mailer
 *
 * This module manage your own mailer
 *
 * This module his a wrapper of nodemailer for node js package
 *
 * For more details on used dependencies read links below :
 * - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
 * - LodAsh : https://lodash.com/
 * - joi : https://github.com/hapijs/joi
 * - nodemailer : https://github.com/andris9/Nodemailer
 * - nodemailer-smtp-transport : https://github.com/andris9/nodemailer-smtp-transport
 *
 * @date : 29/04/2015
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 * @class Mailer
 */
function Mailer() {
    /**
     * The transporter for sending mail
     *
     * @property {Object} transport
     */
    this.transport = {};

    /**
     * Structure of the object that contains all mail options
     *
     * @property {Object} mailOptions
     */
    this.mailOptions = {
        from    : '', // sender address
        to      : '', // list of receivers
        subject : '', // Subject line
        html    : '', // html body
        cc      : '',
        bcc     : ''
    };
}

/**
 * Add a new recipient or an array of recipient<br/>
 * This will remove all previous recipient
 *
 * @method addRecipient
 * @param {String, Array}  dest if it's a string it's contains a email of recepients else if it's an array it contains an array of string (email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addRecipient = function(dest) {
    var result;
    if (_.isString(dest)) {
        //Joi validation for check if dest is an email
        result = Joi.string().email().validate(dest);
    } else if (_.isArray(dest)) {
        //Joi validation for check if dest is anarray of email
        var array = Joi.array().items(Joi.string().email());
        result = array.validate(dest);
    }

    //Check if have an error in Joi validation
    if ((_.isEmpty(result)) || (_.isEmpty(result.error))) {
        logger.info("adding destinataire ok");
        this.mailOptions.to = dest;
        return true;
    }
    logger.warning('Error : at least one string dosen\'t pass email validation');
    return false;
};

/**
 * Set the smtp configuration <br/>
 * Before set the configuration we check with Joi all parameters it's correct<br/>
 * If is correct we set configuration, otherwise no
 *
 * @method setConfigSMTP
 * @param {Object}  smtpConf New smtp configuration
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.setConfigSMTP = function(smtpConf) {
    //Construct a schema to check if smtpConf is ok
    var schema = Joi.object().keys({
        host                : Joi.string().required(),
        secureConnection    : Joi.boolean().required(),
        port                : Joi.number().required(),
        auth                : Joi.object().keys({
            user    : Joi.string().email().required(),
            pass    : Joi.string().required()
        })
    });

    //execute validation
    var result = Joi.validate(smtpConf, schema);

    //check if have error on previous validation
    if ((! _.isEmpty(result)) && (!_.isEmpty(result.error))) {
        logger.error(' setting smtp : doesn\'t match ');

        //Log each error
          _.forEach(result.error.details, function(val)
          {
              logger.warning(  val.message + ' at ' + val.path );
          });
        return false;
    }

    logger.info("set smtp conf ok ");
    this.transport = nodemailer.createTransport( smtpTransport(smtpConf) );
    return true;
};

/**
 * Set the expeditor <br/>
 * This param is save in memory
 *
 * @method setExpeditor
 * @param {String}  exp email of the exoeditor
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.setExpeditor = function(exp) {
    if (_.isString(exp)) {
        this.mailOptions.from = exp;
        logger.info('set expeditor ');
        return true;
    }
    return false;
};

/**
 * Add a new CC recipient or an array of CC recipient<br/>
 * This will remove all previous CC recipient
 *
 * @method addCC
 * @param {String, Array}  cc if it's a string it's contains a email of ccrecepients else if it's an array it contains an array of string (cc email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addCC = function(cc) {
    var result;
    if (_.isString(cc)) {
        //Joi validation for check if cc is an email
        result = Joi.string().email().validate(cc);
    } else if (_.isArray(cc)) {
        //Joi validation for check if cc is anarray of email
        var array = Joi.array().items(Joi.string().email());
        result = array.validate(cc);
    }

    //Check if have an error in Joi validation
    if ((_.isEmpty(result)) || (_.isEmpty(result.error))) {
        logger.info("adding CC ok");
        this.mailOptions.cc = cc ;
        return true;
    }
    logger.error(' adding cc : at least one string dosen\'t pass email validation');
    return false;
};

/**
 * Add a new BCC (CCI) recipient or an array of BCC recipient<br/>
 * This will remove all previous BCC recipient
 *
 * @method addBCC
 * @param {String, Array}  bcc if it's a string it's contains a email of ccrecepients else if it's an array it contains an array of string (bcc email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addBCC = function(bcc) {
    var result;
    if (_.isString(bcc)) {
        //Joi validation for check if cc is an email
        result = Joi.string().email().validate(bcc);
    } else if (_.isArray(bcc)) {
        //Joi validation for check if cc is anarray of email
        var array = Joi.array().items(Joi.string().email());
        result = array.validate(bcc);
    }

    //Check if have an error in Joi validation
    if ((_.isEmpty(result)) || (_.isEmpty(result.error))) {
        logger.info("adding bcc ok");
        this.mailOptions.bcc = bcc ;
        return true;
    }
    logger.error(' adding bcc : at least one string dosen\'t pass email validation');
    return false;
};

/**
 * Send the mail with all parameters ( from, to, cc , bcc)
 * After the mail was send this paramater will be remove : to, cc, bcc, subject, message
 *
 * @method send
 * @param {String} subject Subject of the email
 * @param {String} message Html message to send
 * @param {Function} callback on optional callback, If is not specied a default callback will be execute
 */
Mailer.prototype.send = function( subject, message, callback ) {
    // send mail with defined transport object
    logger.info('send mail ');

    if (_.isString(message)) {
        this.mailOptions.html = message;
    }

    if (_.isString(subject)) {
        this.mailOptions.subject = subject;
    }

    var result;
    //Check if somes params are not empty
    if (!_.isEmpty(this.transport) && !_.isEmpty(this.mailOptions.to) && !_.isEmpty(this.mailOptions.from) ) {
        //check if have specific callback
        if (_.isUndefined(callback)) {
            this.transport.sendMail(this.mailOptions, function(error, info) {
                 //Default callback
                 if (error) {
                     logger.error(error);
                 } else {
                     logger.info(" +++ Message sent: " + info.response);
                 }
             });
        } else {
            this.transport.sendMail(this.mailOptions, callback);
        }
     } else {
         logger.error('can\'t send mail, please check configuration : \n' + this.mailOptions);
     }
     this.deleteMailOptions();
};

/**
 * Delete mail otpions : to, cc, bcc, subject, message (html)
 *
 * @method deleteMailOptions
 */
Mailer.prototype.deleteMailOptions = function() {
    logger.info( 'delete some mail options : to, cc, bcc, subject, html ');
    this.mailOptions.to         = '';
    this.mailOptions.cc         = '';
    this.mailOptions.bcc        = '';
    this.mailOptions.subject    = '';
    this.mailOptions.html       = '';
};

/**
 * Export current Mailer to use it on node
 */
module.exports = new (Mailer)();
