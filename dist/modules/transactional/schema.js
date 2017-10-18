"use strict";function SchemaValidator(e){this.logger=e,this.schemas={alternatives:joi.string().required().empty(),attachments:joi.string().required().empty(),bcc:joi.alternatives().try(joi.object().required().keys({address:joi.string().email().required().empty(),name:joi.string().optional().default(joi.ref("address"))}),joi.string().email().required().empty()),cc:joi.alternatives().try(joi.object().required().keys({address:joi.string().email().required().empty(),name:joi.string().optional().default(joi.ref("address"))}),joi.string().email().required().empty()),date:joi.date().optional().min("now").max("now").default(moment().toString()),from:joi.alternatives().try(joi.object().required().keys({address:joi.string().email().required().empty(),name:joi.string().optional().default(joi.ref("address"))}),joi.string().email().required().empty()),headers:joi.object().required().keys({key:joi.string().required().empty(),value:joi.string().required().empty()}),html:joi.string().required().empty(),inReplyTo:joi.string().required().empty(),localSandbox:joi.boolean().optional(),priority:joi.string().required().valid(["low","normal","high"]),replyTo:joi.string().email().required().empty(),sandbox:joi.boolean().optional().default(!1),subaccount:joi.string().required().empty(),subject:joi.string().required().empty().max(255),text:joi.string().required().empty(),to:joi.alternatives().try(joi.object().required().keys({address:joi.string().email().required().empty(),name:joi.string().optional().default(joi.ref("address"))}),joi.string().email().required().empty())}}var logger=require("yocto-logger"),_=require("lodash"),joi=require("joi"),moment=require("moment");SchemaValidator.prototype.get=function(e){return!!_.has(this.schemas,e)&&_.get(this.schemas,e)},SchemaValidator.prototype.validate=function(e,i){var r=this.get(e);if(_.isBoolean(r))this.logger.warning(["[ SchemaValidator.validate ] - No schema was founded for given name : [",e,"]"].join(" "));else{var t=joi.validate(i,r);if(_.isNull(t.error))return t.value;this.logger.warning(["[ SchemaValidator.validate ] - Cannot validate schema for given name [",e,"]. Error is : ",t.error].join(" "))}return!1},module.exports=function(e){return(_.isUndefined(e)||_.isNull(e))&&(logger.warning("[ SchemaValidator.constructor ] - Invalid logger given. Use internal logger"),e=logger),new SchemaValidator(e)};