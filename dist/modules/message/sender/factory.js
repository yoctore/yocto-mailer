"use strict";function SenderFactory(r){this.logger=r}var logger=require("yocto-logger"),_=require("lodash"),nodemailer=require("nodemailer"),mandrill=require("mandrill-api/mandrill"),Q=require("q"),joi=require("joi");SenderFactory.prototype.createMandrillTransporter=function(r){var e=joi.string().required().empty(),n=joi.validate(r||{},e);if(_.isNull(n.error)){var o=new mandrill.Mandrill(n.value);return o.isReady=function(){var r=Q.defer();return this.users.ping({},function(e){return r.resolve(e)},function(e){return r.reject(e)}),r.promise}.bind(o),o.send=function(r){var e=Q.defer();return this.messages.send({message:r},function(r){return e.resolve(r)},function(r){return e.reject(r)}),e.promise}.bind(o),o}return this.logger.error(["[ Sender.createTransport ] - Cannot create transport for mandrill.","Error is :",n.error].join(" ")),!1},SenderFactory.prototype.createNodeMailerTransporter=function(r){var e=joi.object().required().keys({host:joi.string().required().empty(),port:joi.number().required().min(0),secure:joi.boolean().optional().default(!1),auth:joi.object().optional().keys({user:joi.string().required().empty(),pass:joi.string().required().empty()}),streamTransport:joi.boolean().optional().default(!1)}),n=joi.validate(r||{},e);if(_.isNull(n.error)){var o=nodemailer.createTransport(n.value);return o.isReady=function(){var r=Q.defer();return this.verify(function(e,n){return e?r.reject(e):r.resolve(n)}),r.promise}.bind(o),o.send=function(r){var e=Q.defer();return this.sendMail(r,function(r,n){return r?e.reject(r):e.resolve(n)}),e.promise}.bind(o),o}return this.logger.error(["[ Sender.createTransport ] - Cannot create transport for nodemailer.","Error is :",n.error].join(" ")),!1},module.exports=function(r){return(_.isUndefined(r)||_.isNull(r))&&(logger.warning("[ SenderFactory.constructor ] - Invalid logger given. Use internal logger"),r=logger),new SenderFactory(r)};