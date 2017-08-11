"use strict";function Sender(e){this.logger=e,this.message={},this.NODEMAILER_TYPE="nodemailer",this.MANDRILL_TYPE="mandrill",this.type=this.NODEMAILER_TYPE,this.STATE_PENDING="pending",this.STATE_SUCCESS="success",this.STATE_ERROR="error",this.STATE_READY="ready",this.state={code:"pending",message:null},this.factory=factory(this.logger)}var logger=require("yocto-logger"),_=require("lodash"),Q=require("q"),factory=require("./factory");Sender.prototype.store=function(e,t){return this.message=e,Object.freeze(this.message),this.type=t,this},Sender.prototype.toObject=function(){return this.message},Sender.prototype.updateState=function(e,t){return this.state.code=e||this.STATE_PENDING,this.state.message=t||null,_.has(this.state,"code")&&_.has(this.state,"message")&&this.state.code===e&&this.state.message===t},Sender.prototype.createTransport=function(e){var t=!1;return this.type===this.NODEMAILER_TYPE&&(t=this.factory.createNodeMailerTransporter(e)),this.type===this.MANDRILL_TYPE&&(t=this.factory.createMandrillTransporter(e)),this.updateState(t?this.STATE_READY:this.STATE_ERROR,t?"Transport is ready":"Cannot create transport"),this.updateState(t?this.STATE_READY:this.STATE_ERROR,t?"Transport is ready":"Cannot create transport"),t},Sender.prototype.updateAndBuildStats=function(e,t,s){var r=process.hrtime(e);return this.logger.debug(["[ Sender.send ] - sending email was take :",r[0],"secondes and",r[1]/1e6,"milliseconds"].join(" ")),this.updateState(s),{response:t,stats:{milliseconds:r[1],seconds:r[0]}}},Sender.prototype.send=function(e){var t=Q.defer(),s=process.hrtime();if(_.isEmpty(this.message))t.reject("Message in empty. Build your messsage before send.");else{var r=this.createTransport(e);this.state.code===this.STATE_READY?r.isReady().then(function(){this.logger.debug(["[ Sender.send ] -",this.type,"Connector is ready"].join(" ")),r.send(this.message).then(function(e){return e=this.updateAndBuildStats(s,e,this.STATE_SUCCESS),t.resolve(e)}.bind(this)).catch(function(e){e=this.updateAndBuildStats(s,success,this.STATE_ERROR),t.reject(e)}.bind(this))}.bind(this)).catch(function(e){t.reject(e)}):t.reject(["Transport is on an invalid state. state must be on",this.STATE_READY,"state before sending"].join(" "))}return t.promise},module.exports=function(e){return(_.isUndefined(e)||_.isNull(e))&&(logger.warning("[ Sender.constructor ] - Invalid logger given. Use internal logger"),e=logger),new Sender(e)};