var mailer = require('../src');
var logger = require('yocto-logger');



console.log('mailer type : ' + mailer.get(mailer.mailerType));



var dest = 'cedric@yocto.re';

var expeditor = 'cedric@yocto.re';

var user = {
  name  : 'Cedric Balard',
  email : dest
};

var user1 = {
  name  : 'Tata',
  email : dest
};

var user2 = {
  name  : 'Toto',
  email : dest
};

var userTab = [
  {
    name  : 'myName',
    email : dest
  },
  {
    name  : 'popo',
    email : dest
  }
];


var success = function(value) {

  logger.info( 'youhou mail sent');
  console.log(value);
};

var failed = function(error) {

  logger.error( 'oin oin mail not sent');
  console.log(error);
};

var smtpConf = {
  host                : "ssl0.ovh.net", // hostname
  secureConnection    : true, // use SSL
  port                : "587", // port for secure SMTP
  auth                : {
    user    : "cedric.balard@yocto.re",
    pass    : "mdp"
  }
};


mailer.use('mandrill');
mailer.setConfig('K7GkavS-hDh5ZX4D-kiWxg');

// mailer.use('nodemailer');
// mailer.setConfig(smtpConf);

mailer.setExpeditor(dest);
mailer.addRecipient(user1);
mailer.addCC(userTab);
mailer.addBCC(user2);


mailer.send(' #321 nodemailer ', '<b> test tab </b>').then(success, failed);
