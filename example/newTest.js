var mailer = require('../src');
var logger = require('yocto-logger');




var destTab = [
  {
    name  : 'myName',
    email : 'cedric@yocto.re'
  },
  {
    name  : 'popo',
    email : 'lonny@yocto.re'
  },
  {
    name : 'tata',
    email : 'cedricc@yocto.re'
  }
];


var expeditor = 'cedric@yocto.re';


var success = function(value) {

  logger.info( 'youhou mail sent');
  console.log(value);
};

var failed = function(error) {

  logger.error( 'oin oin mail not sent');
  console.log(error);
};


mailer.use('mandrill');
mailer.setConfig('mjy4NVFO5AOZKkWIfJbnHA');

mailer.setExpeditor(expeditor);


for (var i = 0; i < destTab.length; i++) {
  logger.info('---------------------------------------------- \n Sent mail to : ' + destTab[i]);
  mailer.addRecipient(destTab[i]);
  mailer.send(' #321 nodemailer ', '<b> test tab </b>').then(success, failed);
}
