[![NPM](https://nodei.co/npm/yocto-mailer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-mailer/)

[![Node Required version](https://img.shields.io/badge/node-%3E%3D6.11.2-brightgreen.svg)]()
[![Build Status](https://travis-ci.org/yoctore/yocto-mailer.svg?branch=master)](https://travis-ci.org/yoctore/yocto-mailer)

## Overview

This module provide in one tool a connector for :

 - Nodemailer (SMTP)
 - Mandrill API (/messages)
 - Mailjet API (/messages) (COMMING SOON)

## Motivation

Our main motivation for this module is create and provide a generic & very simple mailer connector for our three main e-mail provider.
 
## Available methods

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

## How To use

See example directory for example code

## And mandrill subacccount ?

It's possible to use mandrill subaccount. for this use the method `setSubAccount(accountName)` to set your subaccount. 

## Breaking Changes

This module was completely rewrite and update to the latest version of each used dependencies.

 