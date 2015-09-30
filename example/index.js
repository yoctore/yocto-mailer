var logger = require('yocto-logger');
var mailer = require('../dist/index.js')();
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
var expeditor = { name : 'MY CUSTOM EXPEDITOR', email : 'my@email.com' } ;

var dest = [ 
  { to    : 'to@email.com',
    name  : 'YOUR NAME', 
    cc    : [],
    bcc   : []
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
    
    mailer.enableCompleteClean();
    _.each(dests, function(d) {

      mailer.addRecipient(d.to, d.name);
      _.each(d.cc, function(cc) {
        mailer.addCC(cc.email, cc.name);
      });
      _.each(d.bcc, function(bcc) {
        mailer.addCC(bcc.email, bcc.name);
      });

      mailer.send('MY-TEST', '<b>MY-MESSAGE</b>').then(function(success) {
        console.log(success);
      }, function(failed) {
        console.log(failed);
      });
    });
  }, function(failed) {
    console.log('error => ' + failed);
  });
}

