"use strict";function Sandbox(e){this.logger=e}var _=require("lodash"),Q=require("q");Sandbox.prototype.check=function(e,n){return(_.get(n,"localSandbox")||!1)&&(this.logger.warning("[ Sandbox.check ] - Sandbox is requested, full sandbox is enabled"),e.send=function(){var e=Q.defer();return e.resolve({mode:"sandbox",message:"All is ok. Test it on remote sandbox or in real mode"}),e.promise}),e},module.exports=function(e){return(_.isUndefined(e)||_.isNull(e))&&(logger.warning("[ Sandbox.constructor ] - Invalid logger given. Use internal logger"),e=logger),new Sandbox(e)};