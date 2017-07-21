/*var logger = require('yocto-logger');
var mailer = require('../src/index-old.js')();
var _      = require('lodash');

var choice = 'mandrill';
var config = {
  mandrill : 'sAOKe0G7VHcql6jpyHSMIg',
  nodemailer : {
    host                : 'YOUR HOST',
    secure              : false,
    port                : 587,
    auth                : {
      user    : 'email@email.com',
      pass    : 'YOUR_PASS'
    }
  }
}

var expeditor = { name : 'MY CUSTOM EXPEDITOR', email : 'technique@yocto.re' } ;

var dest = [
  { to    : 'to@email.com',
    name  : 'YOUR NAME', 
    cc    : [],
    bcc   : [],
    sub : 'test'
  },
  { to    : 'to@email.com',
    name  : 'YOUR NAME',
    cc    : [ {
      email : 'cc@email.com',
      name  : 'CC NAME'
    },
     {
      email : 'cc2@email.com',
      name  : 'CC NAME 2'
    },
    {
      email : 'cc@email.com',
      name  : 'CC'
    }],
    bcc    : [ {
      email : 'bcc@email.com',
      name  : 'BCC NAME'
    }],
  }
];

var dests = [];

for (var i = 0; i < 2; i++) {
  dests.push(dest[i]);
}

if (mailer.use(choice)) {
  mailer.setConfig(config[choice]).then(function(success) {
    console.log('==> CONFIG OK')
    mailer.setExpeditor(expeditor.email, expeditor.name);
    mailer.addReplyTo('no-reply@email.com');
    console.log('ALL IS OK');
    
    //mailer.enableCompleteClean();
    _.each(dests, function(d) {

      mailer.addRecipient(d.to, d.name);
      _.each(d.cc, function(cc) {
        mailer.addCC(cc.email, cc.name);
      });
      _.each(d.bcc, function(bcc) {
        mailer.addCC(bcc.email, bcc.name);
      });

      mailer.send('MY-TEST', '<b>MY-MESSAGE</b>', d.sub).then(function(success) {
        console.log(success);
      }, function(failed) {
        console.log(failed);
      });
    });
  }, function(failed) {
    console.log('error => ' + failed);
  });
}
*/
var message = require('./modules/message')();

var m = message.new();
//m.setFrom('from1@test.com', 'enveloppeFrom1@domain.com');
m.setFrom({ address : 'from@from.com', name : 'from' });
m.addTo({ address : 'to111111@to.com', name : 'to' });
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
/*console.log('======== NodeMailer format =========');
console.log(m.prepare().toNodeMailer());
console.log('======== MANDRILL format ==========');
*/
console.log(m.prepare().toNodeMailer().toObject());

