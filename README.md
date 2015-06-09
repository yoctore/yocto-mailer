# Yocto Mailer

This module manage your own mailer, based on nodemailer module package

<<<<<<< HEAD
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
 var mailer = require('yocto-mailer');
```

#### Set the smtp transport

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

#### Add a new recipient

 ```javascript
 //for a unique recipient
 var rec = 'toto@yocto.re';
 mailer.addRecipient(rec);

 //for mutliple recipient
 var recTab = [
     'toto@yocto.re',
     'foo@yocto.re',
     'bar@yocto.re'
 ];
 mailer.addRecipient(recTab);
 ```

#### Set the expeditor

 ```javascript
 //for a unique expeditor
 var rec = 'toto@yocto.re';
 mailer.setExpeditor(rec);

 //for multiple expeditor
 var recTab = [
     'toto@yocto.re',
     'foo@yocto.re',
     'bar@yocto.re'
 ];
 mailer.setExpeditor(recTab);
 ```

#### Set a cc recipient

 ```javascript
 //for a unique cc recipient
 var rec = 'toto@yocto.re';
 mailer.addCC(rec);

 //for multiple cc recipient
 var recTab = [
     'toto@yocto.re',
     'foo@yocto.re',
     'bar@yocto.re'
 ];
 mailer.addCC(recTab);
 ```

#### Set a bcc recipient

 ```javascript
 //for a unique bcc recipient
 var rec = 'toto@yocto.re';
 mailer.addBCC(rec);

 //for multiple bcc recipient
 var recTab = [
     'toto@yocto.re',
     'foo@yocto.re',
     'bar@yocto.re'
 ];
 mailer.addBCC(recTab);
 ```

#### Set a bcc recipient

 ```javascript
 mailer.addBCC('Foo barr <foo.bar@yocto.re>');
 ```

#### sending email

 ```javascript
mailer.send(' My subject ', '<b>my message</b>', function(error, info) {
 // what append here ?
});
 ```
=======
This module implements two yocto wrapper, one for nodemailer, the second for mandrill
>>>>>>> 276ad48e03b05b5b247691e94ba7ddaf80900d82
