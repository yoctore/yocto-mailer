"use strict";function Mandrill(a){this.client={},this.options={fromName:"",fromEmail:"",to:[],subject:"",html:"",text:"",headers:{}},this.defaultOption=_.omit(_.clone(this.options),["fromEmail","fromName"]),this.logger=a,this.completeClean=!1}var mandrillapi=require("mandrill-api/mandrill"),_=require("lodash"),striptags=require("striptags"),joi=require("joi"),Promise=require("promise"),utils=require("yocto-utils");Mandrill.prototype.processCompleteClean=function(a){return _.isBoolean(a)&&(this.completeClean=a,this.logger.info(["[ Mandrill.setConfig ] -",a?"Enable":"Disable","Complete clean of object."].join(" "))),_.isBoolean(this.completeClean)},Mandrill.prototype.setConfig=function(a){return this.client=new mandrillapi.Mandrill(a),this.logger.debug("[ Mandrill.setConfig ] - Validating api key. Please wait ...."),new Promise(function(b,c){if(_.isString(a))this.client.users.ping2({},function(a){this.logger.info("[ Mandrill.setConfig ] - API Key is valid. Use it !"),b(a)}.bind(this),function(a){this.logger.error(["[ Mandrill.setConfig ] -","Mandrill API key validation failed","Error is :",a.message,"with code :",a.code,"and code name :",a.name].join(" ")),c(a)}.bind(this));else{var d=["[ Mandrill.setConfig ] -","Invalid apiKey given. The api key should be a string and",typeof a,"given"].join(" ");this.logger.error(d),c(d)}}.bind(this))},Mandrill.prototype.send=function(a,b,c){return this.logger.debug("[ Mandrill.send ] - Try sending a new email ..."),this.options.html=_.isString(b)&&!_.isEmpty(b)?b:"",_.isEmpty(this.options.html)||(this.options.text=striptags(b)),this.options.subject=_.isString(a)?a:"",_.isString(c)&&(this.options.subaccount=c),new Promise(function(a,b){if(this.isReady(!0)){var c=_.clone(this.options);this.logger.debug("[ Mandrill.send ] - Cleanning object before send request"),this.clean(),this.clean(!1,!0)||(this.logger.error(["[ Mandrill.send ] - can't send email","option object is not properly clean"].join(" ")),b("[ Mandrill.send ] - can't send email option object is not properly clean")),c=utils.obj.renameKey(c,"fromName","from_name"),c=utils.obj.renameKey(c,"fromEmail","from_email"),this.logger.info(["[ Mandrill.send ] - Sending a new email",_.has(c,"subaccount")?["for subsaccount [",c.subaccount,"]"].join(" "):"","..."].join(" ")),this.client.messages.send({message:c,async:!1},function(b){a(b)},function(a){b(a)})}else this.logger.error("[ Mandrill.send ] - can't send mail, invalid configuration."),b("[ Mandrill.send ] - can't send mail, invalid configuration.")}.bind(this))},Mandrill.prototype.setExpeditor=function(a,b){var c={fromEmail:a,fromName:b},d={fromEmail:joi.string().email().required().trim(),fromName:joi.string()},e=joi.validate(c,d);return _.isNull(e.error)?(_.merge(this.options,c),!0):(_.each(e.error.details,function(a){this.logger.error(["[ Mandrill.setExpeditor ] - Cannot set expeditor.","Error is :",a.message].join(" "))},this),!1)},Mandrill.prototype.addReplyTo=function(a){var b={"Reply-To":a},c={"Reply-To":joi.string().email().required().trim()},d=joi.validate(b,c);return _.isNull(d.error)?(_.merge(this.options.headers,b),!0):(_.each(d.error.details,function(a){this.logger.error(["[ Mandrill.addReplyTo ] - Cannot add a reply-to.","Error is :",a.message].join(" "))},this),!1)},Mandrill.prototype.clean=function(a,b){if(!_.isBoolean(b)||_.isBoolean(b)&&b===!1)this.options.subject=this.options.html=this.options.text="",this.options.to=[],this.options.headers={},_.isBoolean(a)&&a===!0&&_.extend(this.options,this.defaultOption),_.has(this.options,"subaccount")&&delete this.options.subaccount,this.completeClean&&(this.options.fromName=this.options.fromEmail="");else{var c=joi.object().keys({fromName:this.completeClean?joi.string().empty().allow(""):joi.string().empty(""),fromEmail:this.completeClean?joi.string().empty().allow(""):joi.string().email().required().trim(),to:joi.array().length(0),subject:joi.string().empty(""),html:joi.string().empty(""),text:joi.string().empty(""),headers:joi.object().empty({})}).unknown(),d=joi.validate(this.options,c);if(!_.isNull(d.error))return _.each(d.error.details,function(a){this.logger.error(["[ Mandrill.clean ] - Cannot clean current object.","Error is :",a.message].join(" "))},this),!1}return!0},Mandrill.prototype.addRecipient=function(a,b,c){var d=joi.object().keys({email:joi.string().email().required().trim(),name:joi.string(),type:joi.string()["default"]("to").allow("to","cc","bcc")}),e={email:a,name:b,type:c},f=joi.validate(e,d);return _.isNull(f.error)?_.isUndefined(_.find(this.options.to,{email:a,type:f.value.type},"email"))?(this.options.to.push(f.value),this.logger.info(["[ Mandrill.addRecipient ] - email :",f.value.email,"was added into current send list, into [",f.value.type,"] rules"].join(" ")),!0):(this.logger.warning(["[ Mandrill.addRecipient ] - Cannot add recipient.","email already in",f.value.type,"list.",a,"was omit"].join(" ")),!1):(_.each(f.error.details,function(a){this.logger.error(["[ Mandrill.addRecipient ] - Cannot add recipient.","Error is :",a.message].join(" "))},this),!1)},Mandrill.prototype.isReady=function(a){var b=joi.object().keys({fromEmail:joi.string().required(),html:joi.string().required(),subject:joi.string().required(),to:joi.array().items(joi.object().keys({email:joi.string().email().required().trim(),name:joi.string(),type:joi.string()["default"]("to").allow("to","cc","bcc")})).min(1),text:joi.string().required()}).unknown(),c=joi.validate(this.options,b);return _.isBoolean(a)&&a===!0&&(_.isNull(c.error)||_.each(c.error.details,function(a){this.logger.error(["[ Mandrill.isReady ] - Invalid items error is :",a.message].join(" "))},this)),!_.isEmpty(this.client)&&_.isNull(c.error)},module.exports=function(a){return new Mandrill(a)};