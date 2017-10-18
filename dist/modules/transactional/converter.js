"use strict";function Converter(e,r){this.logger=r,this.message=e,this.customiser=customiser(this.logger),this.sender=sender(this.logger),this.rules=JSON.parse(fs.readFileSync(path.resolve([__dirname,"./config/converter.json"].join("/"))))}var logger=require("yocto-logger"),_=require("lodash"),customiser=require("./customiser"),sender=require("../sender"),fs=require("fs"),path=require("path");Converter.prototype.update=function(e){return this.message=e,this},Converter.prototype.toString=function(){return JSON.stringify(this.message)},Converter.prototype.toNodeMailer=function(){return this.convert(this.sender.factory.NODEMAILER_TYPE)},Converter.prototype.toMandrill=function(){return this.convert(this.sender.factory.MANDRILL_TYPE)},Converter.prototype.toMailjet=function(){return this.convert(this.sender.factory.MAILJET_TYPE)},Converter.prototype.convert=function(e){var r=e===this.sender.factory.NODEMAILER_TYPE?this.message:{},t=_.get(this.rules,e);return e!==this.sender.factory.NODEMAILER_TYPE&&!_.isEmpty(t)&&_.has(t,"prerules")&&_.isArray(t.prerules)?(_.map(t.prerules,function(e){var t=_.isFunction(this.customiser[e.customiser])?this.customiser[e.customiser](e.sourcePath,_.get(this.message,e.sourcePath)):_.get(this.message,e.sourcePath);if(_.has(r,e.destinationPath)){var s=_.get(r,e.destinationPath);_.isArray(s)||_.isObject(s)?(_.isArray(s)&&(s.push(t),s=_.flatten(s)),_.isObject(s)&&!_.isArray(s)&&_.merge(s,t)):s=t,t=s}_.isUndefined(t)||_.set(r,e.destinationPath,t)}.bind(this)),_.has(t,"postrules")&&_.map(t.postrules,function(e){_.isFunction(this.customiser[e.customiser])&&(r=this.customiser[e.customiser](r))}.bind(this))):e!==this.sender.factory.NODEMAILER_TYPE&&this.logger.warning(["[ Converter.convert ] - cannot process convertion to [",e,"] format. Rules are not defined or is empty"].join(" ")),this.sender.store(r,e)},module.exports=function(e,r){return(_.isUndefined(r)||_.isNull(r))&&(logger.warning("[ Converter.constructor ] - Invalid logger given. Use internal logger"),r=logger),new Converter(e,r)};