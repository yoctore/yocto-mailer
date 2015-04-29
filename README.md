# Yocto Mailer

This module manage your own mailer

This module his a wrapper of nodemailer for node js package

For more details on used dependencies read links below :
 - yocto-logger : git+ssh://lab.yocto.digital:yocto-node-modules/yocto-utils.git
 - LodAsh : https://lodash.com/
 - joi : https://github.com/hapijs/joi
 - nodemailer : https://github.com/andris9/Nodemailer
 - nodemailer-smtp-transport : https://github.com/andris9/nodemailer-smtp-transport



### Examples :


#### Adding a new yocto mailer

 ```javascript
 var mailer = require('yocto-mailer');
 ```

##### Set the smtp transport

 ```javascript
 var smtpConf = {
     host                : "pop3.yocto.re", // hostname
     secureConnection    : true, // use SSL
     port                : "587", // port for secure SMTP
     auth                : {
         user    : "mailer@yocto.re",
         pass    : 'ThisIsMyPassw0rd'
     }
 };

 mailer.setConfigSMTP(smtpConf);

 ```

##### Add a new recipient

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
 mailer.addRecipient(rec);
 ```

##### Set the expeditor

 ```javascript
 mailer.setExpeditor('Foo barr <foo.bar@yocto.re>');
 ```

##### Set a cc recipient

 ```javascript
 mailer.addCC('Foo barr <foo.bar@yocto.re>');
 ```

##### Set a bcc recipient

 ```javascript
 mailer.addBCC('Foo barr <foo.bar@yocto.re>');
 ```