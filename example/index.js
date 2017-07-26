var logger  = require('yocto-logger');
var message = require('../src')(logger);

var mandrill = false;

var nOptions = {
  host: 'smtp.tipimail.com',
  port: 587,
  secure: false, // secure:true for port 465, secure:false for port 587
  auth: {
      user: '9f86d081884c7d659a2feaa0c55ad015',
      pass: '79b98156b2ed35ecb07ee0f115846924'
  }
};

var mOptions = 'sAOKe0G7VHcql6jpyHSMIg';
var options  = mandrill ? mOptions : nOptions;

// create a new message
var m = message.new();
//m.setFrom('from1@test.com', 'enveloppeFrom1@domain.com');
m.setFrom({ address : 'from@from.com', name : 'from' });
m.addTo({ address : 'mathieu@yocto.re', name : 'to' });
m.addTo('to2222@to.com');
m.addCC({ address : 'cc1@test.com', name : 'cc1' });
m.addCC('cc2@test.com');
m.addBCC({ address : 'bcc1@test.com', name : 'bcc1' });
m.addBCC('bcc2@test.com');
m.setSubject('My subject');
m.setMessage('<b>My subject</b>');
m.addAttachement('./README.md');
m.addAlternative('./Gruntfile.js');
m.setReplyTo('noreply@domain.com');
m.setPriorityToHigh();
m.setPriorityToLow();
m.setHeader({ key : 'X-AAAA-XX', value : 'aaa' });
m.setHeader({ key : 'X-AAAA-EEDDDDD', value : 'aaa' });
m.setHeader({ key : 'X-AAAA-XX', value : 'bbb' });
/*
  console.log('======== NodeMailer format =========');
  console.log(m.prepare().toNodeMailer());
  console.log('======== MANDRILL format ==========');
*/
if (mandrill) {
  m.prepare().toMandrill().send(options).then(function (success) {
    console.log('success =>', success);
  }).catch(function(error) {
    console.log('error =>', error);
  });
} else {
  m.prepare().toNodeMailer().send(options).then(function(success) {
    console.log('success =>', success);
  }).catch(function(error) {
    console.log('error =>', error);
  });
}


