"use strict";function Customiser(e){this.logger=e}var logger=require("yocto-logger"),_=require("lodash");Customiser.prototype.mandrillToFormat=function(e,t){return _.map(t,function(t){return{email:t.address,name:t.name,type:e}})},Customiser.prototype.mandrillImportantFormat=function(e,t){return"high"===t},Customiser.prototype.mandrillAttachementFormat=function(e,t){return _.map(t,function(e){return{content:e.content,name:e.filename,type:e.contentType}})},module.exports=function(e){return(_.isUndefined(e)||_.isNull(e))&&(logger.warning("[ Customiser.constructor ] - Invalid logger given. Use internal logger"),e=logger),new Customiser(e)};