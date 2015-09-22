var mailer = require('../src/index.js');
var assert = require('assert');
var _      = require('lodash');
var utils  = require('yocto-utils');
var should = require('chai').should();

mailer.logger.disableConsole();

describe('Mailer() > Wrapper >', function() {
  var methods = [
    { name : 'use', nbArgs : 1 },
    { name : 'addRecipient', nbArgs : 3 },
    { name : 'addCC', nbArgs : 2 },
    { name : 'addBCC', nbArgs : 2 },
    { name : 'setConfig', nbArgs : 1 },
    { name : 'setExpeditor', nbArgs : 2 },
    { name : 'send', nbArgs : 2 },
    { name : 'isInstanciate', nbArgs : 0 }
  ];
  
  methods.forEach(function(method) {
    var args = utils.unit.generateTypeForUnitTests(null, method.nbArgs);
    
    if (method.name != 'setConfig' && method.name != 'send') {
      describe(method.name + '() must return false with invalid data', function() {
        args.forEach(function(arg) {
          it('Using arg : ' + utils.obj.inspect(arg), function() {
            assert.equal(mailer[method.name].apply(mailer, arg), false);
          });
        });
      });
    } else {
      describe(method.name + '() must reject call', function() { 
        args.forEach(function(arg) {
          it('Using arg : ' + utils.obj.inspect(arg), function(done) {
            mailer[method.name].apply(mailer, arg).then(function(success) {
              done();
            }, function(error) {
              should.exist(error);
              done();
            });
          });
        });
      });
    }
  });
});