# Yocto Mailer

This module manage your own mailer, based on nodemailer module package

## Dependencies

For more details on used dependencies read links below :
 - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
 - loadAsh : https://lodash.com/
 - joi : https://github.com/hapijs/joi
 - nodemailer : https://github.com/andris9/Nodemailer
 - nodemailer-smtp-transport : https://github.com/andris9/nodemailer-smtp-transport


## Options format

Each email that you will sent is based on an object called 'mailOptions'.
This object contains all parameters, and this is his structure :

### Examples :

``` javascript
var mailOptions = {
    from    : '', // sender address
    to      : '', // list of receivers
    subject : '', // Subject line
    html    : '', // html body
    cc      : '', // cc receivers
    bcc     : ''  // receivers
};
```


*The property `from` will be save in memory, but the other will be deleted automatically after the email will be sent.*

## Adding a new yocto mailer

`cc` and `bcc` are two optionally properties. If an error occur when trying validating `cc` and `bcc`, the mail will be sent anyway.

### mandatory steps for sending a email

 1. require the yocto-mailer
 2. set a valid SMTP transport
 3. set an expeditor
 4. set at least one recipient
    * You can also add CC or BCC receivers (optional)
 5. call send() with your subject and contents for sending your email


### Examples :


#### Adding a new yocto mailer

```javascript

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
``` 
