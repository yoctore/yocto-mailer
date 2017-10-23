[![NPM](https://nodei.co/npm/yocto-mailer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-mailer/)

[![Node Required version](https://img.shields.io/badge/node-%3E%3D6.11.2-brightgreen.svg)]()
[![Build Status](https://travis-ci.org/yoctore/yocto-mailer.svg?branch=master)](https://travis-ci.org/yoctore/yocto-mailer)

## Overview

This module provide in one tool a connector for :

 - Nodemailer (SMTP)
 - Mandrill API (/messages)
 - Mailjet API (/messages - /contact - /contactlists)

## Motivation

Our main motivation for this module is create and provide a generic & very simple mailer connector for our three main e-mail provider.

## Available methods

### default method

- setFrom : Set from property on message to send
- addTo : Set to property on message to send
- addCC : Set cc property on message to send
- addBCC : Set bcc property on message to send
- setSubject : Set subject property on message to send
- setMessage : Set message property on message to send
- addAttachment : add an attachement property on message to send
- addAlternative : add an alternative property on message to send
- setReplyTo : set the replyTo property on message to send
- setHeader : set an header property on message to send
- setPriority  : set the message priority on message to send
- setPriorityToHigh : force priority to high
- setPriorityToLow : force priority to low
- setPriorityToNormal  : force priority to normal
- raw : set a message on raw mode, for this you need to use the provider format to set properly your message object (see provider docs)

### mandrill additional methods

- setSubAccount(accountName) to set your subaccount on mandrill process

### mailjet additional methods

See example

## How To use

See example directory for example code

## Need to test in a sandbox mode ?

- enableSandbox : enable sandbox mode for whole provider (All requests was not sent to remote api)
- enableRemoteSandbox : enable sandbox mode for whole provider (But here request was sent to remote api)

## Breaking Changes

### v1.x.x to v2.x.x

This module was completely rewrite and update to the latest version of each used dependencies.
There is no compatibility between v1.x.x and v2.x.x

### v2.x.x to v3.x.x

See example the main change is : 

```
// create a new transactional message
var m = message.new(options);
```

to

```
// create a new transactional message
var m = message.transactional(options);
```

