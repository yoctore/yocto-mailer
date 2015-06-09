var mailer = require('../dist');
var logger = require('yocto-logger');





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

var user3 = {
  name  : 'Jouns',
  email : dest
};

var user4 = {
  name  : 'lalala',
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

var callbackSuccess = function(value) {

  logger.info( 'youhou mail sent');
  console.log(value);
};

var callbackFailed = function(error) {

  logger.error( 'oin oin mail not sent');
  console.log(error);
};


//--------------------//
//    TEST Mandrill   //
//--------------------//

// mailer.mandrill.setMandrillClientAPIKey('K7GkavS-hDh5ZX4D-kiWxg');
// mailer.mandrill.setExpeditor(dest);
// mailer.mandrill.addRecipient(userTab);
// mailer.mandrill.addCC(user1);
// mailer.mandrill.addBCC(user2);
//mailer.mandrill.send(' #123 MANDRILL ', '<b> test tab </b>', callbackSuccess, callbackFailed);


//--------------------//
//  TEST nodemailer   //
//--------------------//

var smtpConf = {
    host                : "ssl0.ovh.net", // hostname
    secureConnection    : true, // use SSL
    port                : "587", // port for secure SMTP
    auth                : {
        user    : "cedric.balard@yocto.re",
        pass    : "w9r0WPeCZ2fm"
    }
};

mailer.nodemailer.setExpeditor(expeditor);
mailer.nodemailer.addRecipient(user);
mailer.nodemailer.setConfigSMTP(smtpConf);

// mailer.nodemailer.addCC(user3);
// mailer.nodemailer.addBCC(userTab);


mailer.nodemailer.send(' #22 nodemailer ', '<b> test tab </b>', callbackSuccess, callbackFailed);
