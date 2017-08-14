var logger  = require('yocto-logger');
var message = require('../src')(logger);

var mandrill = true;

// Define your nodemailer configuration
var nOptions = {
  host    : process.env.SMTP_HOST,
  port    : process.env.SMTP_PORT,
  secure  : false,
  auth    : {
      user  : process.env.SMTP_AUTH_USER,
      pass  : process.env.SMTP_AUTH_PASS
  }
};

// define your mandrill API KEY
var mOptions = process.env.MANDRILL_API_KEY;
var options  = mandrill ? mOptions : nOptions;

// create a new message
var m = message.new();

m.setFrom({ address : 'from@from.com', name : 'from' });
m.addTo({ address : 'mathieu@yocto.re', name : 'to' });
m.addTo('to2222@to.com');
m.addCC({ address : 'cc1@test.com', name : 'cc1' });
m.addCC('cc2@test.com');
m.addBCC({ address : 'bcc1@test.com', name : 'bcc1' });
m.addBCC('bcc2@test.com');
m.setSubject('My subject');
m.setMessage('<b>My subject</b>');
m.addAttachment('./README.md');
m.addAlternative('./README.md');
m.addAttachment('./Fichier_1.pdf');
m.setReplyTo('noreply@domain.com');
m.setPriorityToHigh();
m.setPriorityToLow();
m.setHeader({ key : 'X-AAAA-XX', value : 'aaa' });
m.setHeader({ key : 'X-AAAA-EEDDDDD', value : 'aaa' });
m.setHeader({ key : 'X-AAAA-XX', value : 'bbb' });


// is mandrill needed ?
if (mandrill) {
  console.log(m.prepare().toMandrill().toObject());
  m.prepare().toMandrill().send(options).then(function (success) {
    console.log('success =>', success);
  }).catch(function(error) {
    console.log('error =>', error);
  });
} else {
  console.log(m.prepare().toNodeMailer().toObject());
  m.prepare().toNodeMailer().send(options).then(function(success) {
    console.log('success =>', success);
  }).catch(function(error) {
    console.log('error =>', error);
  });
}



