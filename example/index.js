var mailer = require('../src/index2.js');
var logger = require('yocto-logger');

var choice = 'mandrill';
var config = 'sAOKe0G7VHcql6jpyHSMIg';

if (mailer.use(choice)) {
  mailer.setConfig(config).then(function(success) {
    console.log('config ok')
    mailer.addRecipient('mathieu@yocto.re');
    mailer.addRecipient('mathieu@yocto.re', 'Mathieu ROBERT');
    mailer.addCC('mathieu.robert@yocto.re', 'Mathieu ROBERT', 'cc');
    mailer.addBCC('contact@yocto.re', 'Mathieu ROBERT', 'bcc');
    mailer.setExpeditor('mathieu@yocto.re');
    mailer.send('MY-TEST', '<b>MY-MESSAGE</b>').then(function(success) {
      console.log(success);

      mailer.setExpeditor('mathieu@yocto.re', 'EXPE NAME');
      mailer.send('MY-TEST2', '<b>MY-MESSAGE2</b>').then(function(success) {
        console.log(success);
        
      }, function(failed) {
        console.log(failed);
      });
      
    }, function(failed) {
      console.log(failed);
    });
  }, function(failed) {
    console.log('error => ' + failed);
  });
}


return false;
/*mailer.use('fsdfsd');
mailer.setExpeditor([]);
return false;
*/
//console.log('mailer type : ' + mailer.get(mailer.mailerType));



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
mailer.setConfig('mjy4NVFO5AOZKkWIfJbnHA');

// mailer.use('nodemailer');
// mailer.setConfig(smtpConf);

mailer.setExpeditor(dest);
mailer.addRecipient(user1);



mailer.send(' #321 nodemailer ', '<b> test tab </b>').then(success, failed);
