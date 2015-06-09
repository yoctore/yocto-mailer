'use strict';


var nodemailer      = require("nodemailer");
var smtpTransport   = require('nodemailer-smtp-transport');
var mailer          = require('../src/index.js');
var _               = require('lodash');

var smtpConf = {
    host                : "pop3.yocto.re", // hostname
    secureConnection    : true, // use SSL
    port                : "587", // port for secure SMTP
    auth                : {
        user    : "technique@yocto.re",
        pass    : "Y0c7oPass"
    }
};

var dest = 'mathieu@yocto.re';

var destTab = [
    'mathieu@yocto.re',

];

var destTabBcc = [
    'mathieu@yocto.re',

];

mailer.processEmailFormat(1, 'a');
mailer.setExpeditor(dest);
mailer.addRecipient(dest);
mailer.setConfigSMTP(smtpConf);
//mailer.addCC(destTab);
//mailer.addBCC(destTabBcc);


var res = mailer.send(' #11 nodemailer ', '<b> test tab </b>', function(error, info) {
    console.log('*** specific callback');
    if(error) {
        console.log(error);
    } else {
        console.log('*** mail was send successfuly')
        console.log(info.response);
    }
});


//var res = mailer.send(' #5 nodemailer ', '<b> test tab </b>');
