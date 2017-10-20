var logger  = require('yocto-logger');
var _       = require('lodash');
var message = require('../src')(logger);

var provider = 'mailjet'; // mandrill or mailjet or nodeMailer
var method   = [ 'to', _.upperFirst(provider) ].join('');

// Define your nodemailer configuration
var options = {
  nodeMailer : {
    host    : process.env.SMTP_HOST,
    port    : process.env.SMTP_PORT,
    secure  : false,
    auth    : {
        user  : process.env.SMTP_AUTH_USER,
        pass  : process.env.SMTP_AUTH_PASS
    }
  },
  mandrill : process.env.MANDRILL_API_KEY || '',
  mailjet : {
    publicKey : process.env.MJ_APIKEY_PUBLIC || '',
    privateKey : process.env.MJ_APIKEY_PRIVATE || ''
  }
};

// Get correct options
options  = _.get(options, provider);

// create a new message
var m = message.marketing(options);

/*m.contact.lists.create('testApi2').then(function (success) {
  console.log('list success =>', success);
}).catch(function(error) {
  console.log('error =>', error);
});
*/

/*m.contact.lists.list().then(function (success) {
  console.log('list success =>', success);
}).catch(function(error) {
  console.log('error =>', error);
});
*/
/*m.contact.lists.view('').then(function (success) {
  console.log('view success =>', success);
}).catch(function(error) {
  console.log('error =>', error);
});
*/

/*m.contact.lists.update(1925952).then(function (success) {
  console.log('update success =>', success);
}).catch(function(error) {
  console.log('error =>', error.response.response);
});
*/

/*
m.contact.lists.viewByName('testApi2').then(function (success) {
  console.log('view by name success =>', success);
}).catch(function(error) {
  console.log('error =>', error.response.response);
});
*/

/*
m.contact.create('test@yocto.re', 'Test yocto', { 'Name' : 'Test', 'Second' : 'Foo', 'Bar' : 'Yeah' }).then(function (success) {
  console.log('create success =>', success);
}).catch(function(error) {
  console.log('error =>', error.response.response);
});
*/

m.contact.createAndAddToList('1938300', 'test3@yocto.re', 'Test yocto', { 'Name' : 'Test', 'Second' : 'Foo', 'Bar' : 'Yeah' }).then(function (success) {
  console.log('create and add to list success =>', success);
}).catch(function(error) {
  console.log('error =>', error.response.response);
});



//console.log(m);