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
    MJ_APIKEY_PUBLIC : process.env.MJ_APIKEY_PUBLIC || '',
    MJ_APIKEY_PRIVATE : process.env.MJ_APIKEY_PRIVATE || ''
  }
};

// Get correct options
options  = _.get(options, provider);

// create a new message
var m = message.transactional();

m.setFrom({ address : 'demo@yocto.re', name : 'from' });
m.addTo({ address : 'mathieu@yocto.re', name : 'to' });
/*m.addTo('to2222@to.com');
m.addCC({ address : 'cc1@test.com', name : 'cc1' });
m.addCC('cc2@test.com');
m.addBCC({ address : 'bcc1@test.com', name : 'bcc1' });
m.addBCC('bcc2@test.com');
*/
m.setSubject('My subject');
m.setMessage('<b>My aaaaaa</b>');
m.addAttachment('../README.md');
m.addAlternative('../README.md');
m.addAttachment('./Fichier_1.pdf');
//m.setReplyTo('noreply@domain.com');
//m.setPriorityToHigh();
//m.setPriorityToLow();
//m.setHeader({ key : 'X-AAAA-XX', value : 'aaa' });
//m.setHeader({ key : 'X-AAAA-EEDDDDD', value : 'aaa' });
//m.setHeader({ key : 'X-AAAA-XX', value : 'bbb' });
//m.enableSandbox();
//console.log(m.prepare()[method]().toObject());
m.prepare()[method]().send(options).then(function (success) {
  console.log('success =>', success);
}).catch(function(error) {
  console.log('error =>', error);
});

