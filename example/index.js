var mailer = require('../src/index.js');
var logger = require('yocto-logger');
var _      = require('lodash');

var choice = 'mandrill';
var config = {
  mandrill : 'sAOKe0G7VHcql6jpyHSMIg',
  nodemailer : {
    host                : 'ssl0.ovh.net',
    secure    : false,
    port                : 587,
    auth                : {
      user    : 'cedric.balard@yocto.re',
      pass    : 'w9r0WPeCZ2fm'
    }
  }
}
var expeditor = { name : 'MY CUSTOM EXPEDITOR', email : 'mathieu@yocto.re' } ;

var dest = [ 
  { to    : 'mathieu.robert@yocto.re',
    name  : 'ROBERT Mathieu', 
    cc    : [],
    bcc   : []
  },
  { to    : 'mathieu@yocto.re',
    name  : 'ROBERT Mathieu', 
    cc    : [ {
      email : 'contact@yocto.re',
      name  : 'MATHIEU CC'
    },
     {
      email : 'technique@yocto.re',
      name  : 'MATHIEU CC 2'
    },
    {
      email : 'contact@yocto.re',
      name  : 'MATHIEU CC'
    }],
    bcc    : [ {
      email : 'mathieu@yocto.re',
      name  : 'MATHIEU BCC'
    }],
  }
];

var dests = [];

for (var i = 0; i < 1; i++) {
  dests.push(dest[i]);
}

if (mailer.use(choice)) {
  mailer.setConfig(config[choice]).then(function(success) {
    console.log('==> CONFIG OK')
    mailer.setExpeditor(expeditor.email, expeditor.name);
    mailer.addReplyTo('technique@yocto.re');
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

