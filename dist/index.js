"use strict";function Mailer(){this.transport={},this.mailOptions={from:"",to:"",subject:"",html:"",cc:"",bcc:""},this.defaultMailOption=_.omit(_.clone(this.mailOptions),"from")}var nodemailer=require("nodemailer"),smtpTransport=require("nodemailer-smtp-transport"),logger=require("yocto-logger"),_=require("lodash"),Joi=require("joi");Mailer.prototype.setConfigSMTP=function(a){var b=Joi.object().keys({host:Joi.string().required(),secureConnection:Joi["boolean"]().required(),port:Joi.number().required(),auth:Joi.object().keys({user:Joi.string().email().required(),pass:Joi.string().required()}).allow("user","pass")}).allow("host","secureConnection","port","auth"),c=Joi.validate(a,b);return _.isEmpty(c)||_.isEmpty(c.error)?(logger.info("[ Mailer.setConfigSMTP ] - Set smtp configuration ok"),this.transport=nodemailer.createTransport(smtpTransport(a)),!0):(logger.error("[ Mailer.setConfigSMTP ] - setting smtp, error description :"),_.forEach(c.error.details,function(a){logger.warning("[ Mailer.setConfigSMTP ] - "+a.message+" at "+a.path)}),!1)},Mailer.prototype.addRecipient=function(a){return this.processEmailFormat(a,"to")},Mailer.prototype.setExpeditor=function(a){return this.processEmailFormat(a,"from")},Mailer.prototype.addCC=function(a){return this.processEmailFormat(a,"cc")},Mailer.prototype.addBCC=function(a){return this.processEmailFormat(a,"bcc")},Mailer.prototype.processEmailFormat=function(a,b){var c=Joi.string().email();return _.isArray(a)&&(c=Joi.array().items(Joi.string().email())),c=c.validate(a),_.isEmpty(c)||_.isEmpty(c.error)?(logger.info("[ Mailer.processEmailFormat ] - Validation email for field : "+b),this.mailOptions[b]=a,!0):(logger.error("[ Mailer.processEmailFormat ] - Validation email failed, at least one string dosen't pass email validation for field : "+b),!1)},Mailer.prototype.send=function(a,b,c){function d(a,b){a?logger.error("[ Mailer.send.defaultCallBackSendMail ] -  error sending message, more details : "+a):logger.info("[ Mailer.send.defaultCallBackSendMail ] - message sent, more info : "+b.response)}function e(){logger.info("[ Mailer.deleteMailOptions ] - Delete mail otpions"),_.extend(f.mailOptions,f.defaultMailOption)}logger.info("[ Mailer.send ] - Try sending a new email"),_.isString(b)&&(this.mailOptions.html=b),_.isString(a)&&(this.mailOptions.subject=a);var f=this;_.isEmpty(this.transport)||_.isEmpty(this.mailOptions.to)||_.isEmpty(this.mailOptions.from)||_.isEmpty(this.mailOptions.subject)||_.isEmpty(this.mailOptions.html)?(logger.error("[ Mailer.send ] - can't send mail, please check configuration."),console.log(this.mailOptions),e(),console.log(this.mailOptions)):this.transport.sendMail(this.mailOptions,function(a,b){_.isFunction(c)?c(a,b):d(a,b),e()})},module.exports=new Mailer;