'use strict';


var nodemailer      = require("nodemailer");
var smtpTransport   = require('nodemailer-smtp-transport');
var mailer          = require('../dist/index.js');
var _               = require('lodash');

var smtpConf = {
    host                : "pop3.yocto.re", // hostname
    secureConnection    : true, // use SSL
    port                : "587", // port for secure SMTP
    auth                : {
        user    : "cedric.balard@yocto.re",
        pass    : "w9r0WPeCZ2fm"
    }
};

var dest = 'cedric@yocto.re';

var destTab = [
    'cedric@yocto.re',
    'cedric@yocto.re'
];

var destTabBcc = [
    'toto@yocto.re',
    'tata@yocto.re'
];

mailer.setExpeditor(destTab);
mailer.addRecipient(dest);
mailer.setConfigSMTP(smtpConf);
mailer.addCC(destTab);
mailer.addBCC(destTabBcc);


var res = mailer.send(' #10 nodemailer ', '<b> test tab </b>', function(error, info) {
    console.log('*** specific callback');
    if(error) {
        console.log(error);
    } else {
        console.log('*** mail was send successfuly')
        console.log(info.response);
    }
});


//var res = mailer.send(' #5 nodemailer ', '<b> test tab </b>');
