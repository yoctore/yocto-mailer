/**
 * Unit tests
 */
var mailer = require('../src/index.js');
var assert = require('assert');
var util   = require('util');
var _ = require('lodash');

var enableLog = false;

// start
var index = 0;
var args  = [];   
var types = [ null, undefined, 1, true, false, NaN, 'a', '' ];
var po = 3;
      
// build type list
/*while(index < types.length) {
  for (var i = 0; i < types.length; i++) {
    t = types[i];
  
    args.push({ arg1 : types[index], arg2 : t });
  
    if ((args.length % types.length) == 0) {
      index++;
    }    
  }
}; 
*/
types.forEach(function(t) {
  var fo = [];
  
  for(var i = 0; i < po; i++) {
    fo[i] = t;
  }
  args.push(fo);
});


describe('Mailer() >', function() {

  var moteur = [
    'nodemailer',
    'mandrill'
  ];

  var methods = [
    'processEmailFormat',
    'addBCC', 
    'addCC',
    'setExpeditor',
    'addRecipient'
  ];
  
  moteur.forEach(function(m) {

    
    mailer[m].logger.enableConsole(enableLog);      
    
    methods.forEach(function(method) {
        describe(m + '.' + method + '() must return false with invalid data', function() {    
          args.forEach(function(arg) {
            it('Using arg : ' + util.inspect(arg, { depth : null }), function() { 
              assert.equal(mailer.get(m)[method].apply(mailer, arg), false);      
            });
          });
        });
        
        describe(m + '.' + method + '() must return false with invalid option', function() {    
          return false;
          var args = [
            // null
            { arg1 : '', arg2 : null },
            { arg1 : undefined, arg2 : undefined },
            { arg1 : null, arg2 : 1 },
            { arg1 : null, arg2 : true },
            { arg1 : null, arg2 : false },
            { arg1 : null, arg2 : NaN },
            { arg1 : null, arg2 : 'a' },
            { arg1 : null, arg2 : '' },
          ];
          
          args.forEach(function(arg) {
            it('Using arg : ' + util.inspect(arg, { depth : null }), function() {    
              assert.equal(mailer[method](arg.arg1, arg.arg2), false);      
            });
          });
        });
      });    
  });
});