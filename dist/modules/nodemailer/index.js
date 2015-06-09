"use strict";function NodeMailer(){this.transport={},this.mailOptions={from:"",to:[],subject:"",html:"",cc:[],bcc:[]},this.defaultMailOption=_.omit(_.clone(this.mailOptions),"from"),this.logger=logger}var nodemailer=require("nodemailer"),smtpTransport=require("nodemailer-smtp-transport"),logger=require("yocto-logger"),_=require("lodash"),joi=require("joi");NodeMailer.prototype.setConfigSMTP=function(a){var b=joi.object().keys({host:joi.string().required(),secureConnection:joi["boolean"]().required(),port:joi.number().required(),auth:joi.object().keys({user:joi.string().email().required(),pass:joi.string().required()}).allow("user","pass")}).allow("host","secureConnection","port","auth"),c=joi.validate(a,b);return _.isEmpty(c)||_.isEmpty(c.error)?(this.logger.info("[ NodeMailer.setConfigSMTP ] - Set smtp configuration ok"),this.transport=nodemailer.createTransport(smtpTransport(a)),!0):(this.logger.error("[ NodeMailer.setConfigSMTP ] - setting smtp, error description :"),_.forEach(c.error.details,function(a){this.logger.warning("[ NodeMailer.setConfigSMTP ] - "+a.message+" at "+a.path)}),!1)},NodeMailer.prototype.addRecipient=function(a){return this.processEmailFormat(a,"to")},NodeMailer.prototype.setExpeditor=function(a){return _.isString(a)?this.processEmailFormat(a,"from"):(this.logger.error("Error - from_email should be a string email"),"Error - from_email should be a string email")},NodeMailer.prototype.addCC=function(a){return this.processEmailFormat(a,"cc")},NodeMailer.prototype.addBCC=function(a){return this.processEmailFormat(a,"bcc")},NodeMailer.prototype.processEmailFormat=function(a,b){if("from"!==b&&_.isString(a))return this.logger.warning("Error "+b+" should be on object or array of object"),"Error "+b+" should be on object or array of object";var c=joi.string().email();return _.isObject(a)&&(_.isArray(a)?c=joi.array().items(joi.object().keys({email:joi.string().email(),name:joi.string(),type:joi.string()})):(a.address=a.email,delete a.email,c=joi.object().keys({address:joi.string().email(),name:joi.string()}))),c=c.validate(a),_.isEmpty(c)||_.isEmpty(c.error)?(this.logger.debug("[ NodeMailer.processEmailFormat ] - Validation email for field : "+b),_.isArray(this.mailOptions[b])&&_.isObject(a)?_.isArray(a)?(_.forEach(a,function(a){this.mailOptions[b].push(a)},this),!0):(this.mailOptions[b].push(a),!0):(this.mailOptions[b]=a,!0)):(console.log(c.error),this.logger.error("[ NodeMailer.processEmailFormat ] - Validation email failed, at least one string dosen't pass email validation for field : "+b),!1)},NodeMailer.prototype.send=function(a,b,c){function d(a){a.logger.debug("[ NodeMailer.deleteMailOptions ] - Delete mail otpions"),_.extend(a.mailOptions,a.defaultMailOption)}this.logger.info("[ NodeMailer.send ] - Try sending a new email"),this.mailOptions.html=_.isString(b)?b:"",this.mailOptions.subject=_.isString(a)?a:"",c=!_.isUndefined(c)&&_.isFunction(c)?c:function(a){this.logger.info("[ MandrillWrapper.send.defaultCallBackSendMail ] -  sending message, info/error details id : "+a)};var e=this;_.isEmpty(this.transport)||_.isEmpty(this.mailOptions.to)||_.isEmpty(this.mailOptions.from)||_.isEmpty(this.mailOptions.subject)||_.isEmpty(this.mailOptions.html)?(this.logger.error("[ NodeMailer.send ] - can't send mail, please check configuration."),d(this)):this.transport.sendMail(this.mailOptions,function(a,b){var f=_.isEmpty(a)?b:a;c(f),d(e)})},module.exports=new NodeMailer;