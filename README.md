![alt text](https://david-dm.org/yoctore/yocto-mailer.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-mailer/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-mailer)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-mailer/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-mailer/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-mailer/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-mailer)
[![Build Status](https://travis-ci.org/yoctore/yocto-mailer.svg?branch=master)](https://travis-ci.org/yoctore/yocto-mailer)

## Overview

This module is a part of yocto node modules for NodeJS.

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

This module provide in one tool a connector for Nodemailer (SMTP) and Mandrill API.

## Motivation

Our main motivation for this module is, create and provide a generic & very simple mailer connector for Mandrill et Nodemailer (SMTP Transport) in the same tool.

## Methods

- use(connectorName) : select a connector from given name
- setExpeditor(email, name) : define en expeditor
- addReplyTo (email) : add a reply to
- mailer.addRecipient(email, name) : add a recipient 
- mailer.addCC(email, name) : add a recipient on cc field
- mailer.addBCC(email, name) : add a recipient on bcc field

## How To use

```javascript
var mailer = require('yocto-mailer')();
// Set expeditor config
var expeditor = {
  email : 'email@expeditor.com',
  name  : 'Expeditor NAME'
};  

// Mandrill Config
var connector = 'mandrill';
var config    = 'YOUR API KEY';

// NodeMailer SMTP Config
var connector = 'nodemailer';
var config    = {}; // your config object see nodemailer SMTP config

// Process
// select your connector
if (mailer.use(connector)) {
  
  // set your config
  mailer.setConfig(config).then(function(success) {
    console.log('==> CONFIG OK');
    
    // set your expeditor
    mailer.setExpeditor(expeditor.email, expeditor.name);
    
    // add reply to if needed
    mailer.addReplyTo('no-reply@email.com');
    
    // add a recipient
    mailer.addRecipient('to@email.com', 'TO NAME');
    // add CC
    mailer.addCC('cc@email.com', 'CC NAME');
    // add BCC
    mailer.addBCC('bcc@email.com', 'BCC NAME');

    // send
    mailer.send('MY-TEST', '<b>MY-MESSAGE</b>').then(function(success) {
      console.log(success);
    }, function(failed) {
      console.log(failed);
    });
  }, function(failed) {
    console.log('error => ' + failed);
  });
}
```

## Use mandrill subacccount

It's possible to use mandrill subaccount. To use it just add on *third* args of your send function,
the id of subaccount.

## Logging in tool

By Default this module include [yocto-logger](https://www.npmjs.com/package/yocto-logger) for logging.
It's possible to inject in your mailer instance your current logger instance if is another `yocto-logger` instance.

For example : 

```javascript 
var logger = require('yocto-logger');
// EXTRA CODE HERE FOR YOUR APP
// AGAIN & AGAIN
var mailer = require('yocto-mailer')(logger);
```

## Tricks

In some case we need to clean complete send object and config before the next send request, that's why you can use `enableCompleteClean` method to enable this function.

## Next Step

- Add Attachement process
- Changing promise usage from PromiseJS to Q (Migration was processed in a version 2.0.0)

## Changelog

All history is [here](https://gitlab.com/yocto-node-modules/yocto-mailer/blob/master/CHANGELOG.md)