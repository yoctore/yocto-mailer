# Yocto Mailer

This module manage your own mailer

This module his a wrapper of mandrill-api for node js package

For more details on used dependencies read links below :
- yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
- LodAsh : https://lodash.com/
- joi : https://github.com/hapijs/joi
- mandrill-api : https://www.npmjs.com/package/mandrill-api


### Format of object mailOptions

Each email that you will sent is based on an object called 'mailOptions'.
This object contains all parameters, and this is his structure :

### Examples :

``` javascript
var mailOptions = {
  from_email : '', // sender address
  to         : [], // list of receivers
  subject    : '', // Subject line
  html       : '' // html body
};
```

The property `from_email` will be save in memory, but the other will be deleted automatically after the email will be sent.

#### Adding a new yocto mailer

`cc` and `bcc` are two optionally properties. If an error occur when trying validating `cc` and `bcc`, the mail will be sent anyway.

### Obligatory step for sending a email

1. require the module like this : var mandrill = require('MandrillWrapper');
2. set a valid SMTP transport
3. set a valid mandrill apiKey
4. set at least one recipient
  * You can optionaly add CC or BCC receivers
5. call send() with your subject and contents for sending your email


### Examples :


##### Adding a new yocto mailer

```javascript
var mandrill = require('MandrillWrapper');
```


##### Set the mandrill client

```javascript
mandrill.setMandrillClientAPIKey('JFEKFEa-738dKJFEç-OLN974');
```

##### Add a new recipient

```javascript
//for a unique recipient
var user = {
  name  : 'Foo Bar',
  email : 'foo@bar.com'
};
mandrill.addRecipient(user);

//for mutliple recipient
var users = [
  { name  : 'Foo Bar',
  email : 'foo@bar.com' },
  { name  : 'Toto tata',
  email : 'tata@tata.com' }
];
mandrill.addRecipient(user);
```

##### Set the expeditor

```javascript
//for a unique expeditor
var rec = 'toto@yocto.re';
mailer.setExpeditor(rec);
```

##### Set a cc recipient

```javascript
//for a unique recipient
var user = {
  name  : 'Foo Bar',
  email : 'foo@bar.com'
};
mandrill.addCC(user);

//for mutliple recipient
var users = [
  { name  : 'Foo Bar',
  email : 'foo@bar.com' },
  { name  : 'Toto tata',
  email : 'tata@tata.com' }
];
mandrill.addCC(user);
```

##### Set a bcc recipient
```javascript
//for a unique recipient
var user = {
  name  : 'Foo Bar',
  email : 'foo@bar.com'
};
mandrill.addCC(user);

//for mutliple recipient
var users = [
  { name  : 'Foo Bar',
  email : 'foo@bar.com' },
  { name  : 'Toto tata',
  email : 'tata@tata.com' }
];
mandrill.addBCC(user);
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

mandrill.send(' #123 MANDRILL ', '<b> test tab </b>', callbackSuccess, callbackFailed);
// Without callback
mandrill.send(' #123 MANDRILL ', '<b> test tab </b>');
```
