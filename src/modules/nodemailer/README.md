# Yocto Mailer

This module manage your own mailer

This module his a wrapper of nodemailer for node js package

For more details on used dependencies read links below :
- yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
- LodAsh : https://lodash.com/
- joi : https://github.com/hapijs/joi
- nodemailer : https://github.com/andris9/Nodemailer
- nodemailer-smtp-transport : https://github.com/andris9/nodemailer-smtp-transport


### Format of object mailOptions

Each email that you will sent is based on an object called 'mailOptions'.
This object contains all parameters, and this is his structure :

### Examples :

``` javascript
var mailOptions = {
  from    : '', // sender address
  to      : [], // list of receivers
  subject : '', // Subject line
  html    : '', // html body
  cc      : [], // cc receivers
  bcc     : []  // receivers
};
```


The property `from` will be save in memory, but the other will be deleted automatically after the email will be sent.

#### Adding a new yocto mailer

`cc` and `bcc` are two optionally properties. If an error occur when trying validating `cc` and `bcc`, the mail will be sent anyway.

### Obligatory step for sending a email

1. require the yocto-mailer
2. set a valid SMTP transport
3. set an expeditor
4. set at least one recipient
 * You can optionaly add CC or BCC receivers
5. call send() with your subject and contents for sending your email


### Examples :


##### Adding a new yocto mailer

```javascript
var mailer = require('yocto-mailer');
```


##### Set the smtp transport

```javascript
var smtpConf = {
  host                : "host", // hostname
  secureConnection    : true, // use SSL
  port                : "PORT", // port for secure SMTP
  auth                : {
    user    : "user@domain.com",
    pass    : 'ThisIsMyPassw0rd'
  }
};

mailer.setConfigSMTP(smtpConf);
```

##### Add a new recipient

```javascript
//for a unique recipient
var user = {
  name  : 'Foo Bar',
  email : 'foo@bar.com'
};
nodemailer.addRecipient(user);

//for mutliple recipient
var users = [
  { name  : 'Foo Bar',
  email : 'foo@bar.com' },
  { name  : 'Toto tata',
  email : 'tata@tata.com' }
];
nodemailer.addRecipient(user);
```

##### Set the expeditor

```javascript
//for a unique expeditor
var rec = 'toto@yocto.re';
nodemailer.setExpeditor(rec);
```

##### Set a cc recipient

```javascript
//for a unique recipient
var user = {
  name  : 'Foo Bar',
  email : 'foo@bar.com'
};
nodemailer.addCC(user);

//for mutliple recipient
var users = [
  { name  : 'Foo Bar',
  email : 'foo@bar.com' },
  { name  : 'Toto tata',
  email : 'tata@tata.com' }
];
nodemailer.addCC(user);
```

##### Set a bcc recipient
```javascript
//for a unique recipient
var user = {
  name  : 'Foo Bar',
  email : 'foo@bar.com'
};
nodemailer.addCC(user);

//for mutliple recipient
var users = [
  { name  : 'Foo Bar',
  email : 'foo@bar.com' },
  { name  : 'Toto tata',
  email : 'tata@tata.com' }
];
nodemailer.addBCC(user);
```


##### Send a mail

```javascript
var callbackSuccess = function(value) {

  logger.info( 'youhou mail sent');
  console.log(value);
};

var callbackFailed = function(error) {

  logger.error( 'oin oin mail not sent');
  console.log(error);
};

nodemailer.send(' #123 MANDRILL ', '<b> test tab </b>', callbackSuccess, callbackFailed);
// Without callback
nodemailer.send(' #123 MANDRILL ', '<b> test tab </b>');
```
