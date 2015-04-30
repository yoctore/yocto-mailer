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

    /**
     * Clone the mailOptions and omit parameter 'from'<br/>
     * It used for deleteMailOptions when a mail as sent
     *
     * @property {Object} defaultMailOtpion
     */
    this.defaultMailOption = _.omit(_.clone(this.mailOptions), 'from');
}

/**
 * Set the smtp configuration <br/>
 * Before set the configuration we check with Joi all parameters it's correct<br/>
 * If is correct we set configuration, otherwise no
 *
 * @method setConfigSMTP
 * @param {Object}  smtpConf New smtp configuration
 * @return {Boolean} true if success, false otherwise
 *
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
        }).allow('user','pass')
    }).allow('host','secureConnection','port','auth');

    //execute validation
    var result = Joi.validate(smtpConf, schema);

    //check if have error on previous validation
    if (!_.isEmpty(result) && !_.isEmpty(result.error)) {
        logger.error('[ Mailer.setConfigSMTP ] - setting smtp, error description :');

        //Log each error
          _.forEach(result.error.details, function(val) {
              logger.warning('[ Mailer.setConfigSMTP ] - ' + val.message + ' at ' + val.path );
          });
        return false;
    }

    logger.info('[ Mailer.setConfigSMTP ] - Set smtp configuration ok ');
    this.transport = nodemailer.createTransport(smtpTransport(smtpConf));
    return true;
};

/**
 * Add a new recipient or an array of recipient<br/>
 * This will remove all previous recipient
 *
 * @method addRecipient
 * @param {String, Array}  dest if it's a string it's contains a email of recepients else if it's an array it contains an array of string (email)
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.addRecipient = function(to) {
    return this.processEmailFormat(to, 'to');
};

/**
 * Set the expeditor <br/>
 * This param is save in memory
 *
 * @method setExpeditor
 * @param {String}  exp email of the exoeditor
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.setExpeditor = function(from) {
    return this.processEmailFormat(from, 'from');
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
    return this.processEmailFormat(cc, 'cc');
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
    return this.processEmailFormat(bcc, 'bcc');
};

/**
 * Check if object 'data' conatains only email <br/>
 * If it's not case return false and logg an error <br/>
 * Else add 'data' into Mailer.mailOptions.<option>
 *
 * @method addBCC
 * @param {String, Array}  data that shoul'd be contains only email
 * @param option It's the name of the property in Mailer.mailOptions
 * @return {Boolean} true if success, false otherwise
 */
Mailer.prototype.processEmailFormat = function(data, option) {
    //Set a default value
    var result = Joi.string().email();

    //Change result if needed
    if (_.isArray(data)) {
         result = Joi.array().items(Joi.string().email());
    }

    //Execute the Joi vailidation
    result = result.validate(data);

    //Check if have no error in Joi validation
    if ((_.isEmpty(result)) || (_.isEmpty(result.error))) {
        logger.info( '[ Mailer.processEmailFormat ] - Validation email for field : ' + option);
        this.mailOptions[option] = data;
        return true;
    }

    logger.error('[ Mailer.processEmailFormat ] - Validation email failed, at least one string dosen\'t pass email validation for field : ' + option);
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
Mailer.prototype.send = function(subject, message, callback) {
    // send mail with defined transport object
    logger.info('[ Mailer.send ] - Try sending a new email');

    if (_.isString(message)) {
        this.mailOptions.html = message;
    }

    if (_.isString(subject)) {
        this.mailOptions.subject = subject;
    }

    //Default callback in case 'callback' is empty
    function defaultCallbackSendMail(error, info) {
        if (error) {
            logger.error('[ Mailer.send.defaultCallBackSendMail ] -  error sending message, more details : ' + error);
        } else {
            logger.info('[ Mailer.send.defaultCallBackSendMail ] - message sent, more info : ' + info.response);
        }
    }

    //saveContext for deleteMailOptions()
    var context = this;
    function deleteMailOptions () {
        logger.info('[ Mailer.deleteMailOptions ] - Delete mail otpions');

        //Extend defaultMailOption to remove this mail options : to, cc, bcc, html
        _.extend(context.mailOptions, context.defaultMailOption);
    }

    //Check if somes params are not empty
    if (!_.isEmpty(this.transport) && !_.isEmpty(this.mailOptions.to) &&
        !_.isEmpty(this.mailOptions.from)  && !_.isEmpty(this.mailOptions.subject)  &&
        !_.isEmpty(this.mailOptions.html)) {

       //SendMail
       this.transport.sendMail(this.mailOptions, function(error, info) {

           //Determine which callback is called
           if (!_.isFunction(callback)) {
               defaultCallbackSendMail(error, info);
           } else {
               callback(error, info);
           }

           //Delete options
           deleteMailOptions();
       });

     } else {
         logger.error('[ Mailer.send ] - can\'t send mail, please check configuration.');
         console.log(this.mailOptions);

         //Delete options
         deleteMailOptions();
         console.log(this.mailOptions);

    }
 };

/**
 * Export current Mailer to use it on node
 */
module.exports = new (Mailer)();
