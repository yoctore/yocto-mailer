"use strict";function Message(e){this.logger=e,this.message={},this.schema=require("./schema")(this.logger),this.transformers=require("./transformer")(this.logger),this.checker=require("./checker")(this.logger),this.converter=require("./converter")(this.message,this.logger)}var _=require("lodash"),uuid=require("uuid");Message.prototype.set=function(e,t,s,r){return!1!==(t=this.schema.validate(e,t))&&!(_.isFunction(this.checker[r])&&!this.checker[r](t))&&(_.isFunction(this.transformers[s])&&(s=this.transformers[s](t)),this.addKey(e,s||t))},Message.prototype.addKey=function(e,t){if(_.has(this.message,e)){var s=_.get(this.message,e);_.isArray(s)||_.isObject(s)?(_.isArray(s)&&(s.push(t),s=_.flatten(s)),_.isObject(s)&&!_.isArray(s)&&_.merge(s,t)):s=t,t=s}return _.set(this.message,e,t),_.has(this.message,e)},Message.prototype.setFrom=function(e){return this.set("from",e,"toAddressObject")},Message.prototype.addTo=function(e){return this.set("to",e,"toAddressArray")},Message.prototype.addCC=function(e){return this.set("cc",e,"toAddressArray")},Message.prototype.addBCC=function(e){return this.set("bcc",e,"toAddressArray")},Message.prototype.setSubject=function(e){return this.set("subject",e)},Message.prototype.setMessage=function(e){return this.set("html",e)&&this.set("text",e,"htmlToText")},Message.prototype.addAttachement=function(e){return this.set("attachements",e,"attachementsToArray","isFile")},Message.prototype.addAlternative=function(e){return this.set("alternatives",e,"attachementsToArray","isFile")},Message.prototype.setReplyTo=function(e){return this.set("replyTo",e)&&this.set("inReplyTo",uuid.v4())},Message.prototype.setHeader=function(e){return this.set("headers",e,"toHeaderObject")},Message.prototype.setPriority=function(e){return this.set("priority",e)},Message.prototype.setPriorityToHigh=function(){return this.set("priority","high")},Message.prototype.setPriorityToLow=function(){return this.set("priority","low")},Message.prototype.setPriorityToNormal=function(){return this.set("priority","normal")},Message.prototype.prepareLastOperations=function(){return this.setHeader({key:"messageId",value:uuid.v4()})&&this.set("date")},Message.prototype.raw=function(e){return _.merge(this.message,e),!0},Message.prototype.setSubAccount=function(e){return this.set("subaccount",e)},Message.prototype.prepare=function(){return this.prepareLastOperations(),Object.freeze(this.message),this.converter.update(this.message)},module.exports=Message;