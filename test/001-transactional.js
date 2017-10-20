var logger  = require('yocto-logger');
var message = require('../dist/index.js')(logger);
var assert = require('assert');
var _      = require('lodash');
var utils  = require('yocto-utils');
var should = require('chai').should();

// disable console we dont need it
message.logger.disableConsole();

// create a New transactional message
var m = message.transactional();

describe('Message ()', function() {
  describe('New transactional message should be valid and type of object', function() {
    it ('Message should be an object', function () {
      m.should.to.be.a('object');
    });
    it ('Message should be not empty', function () {
      m.should.not.be.empty;
    });
  });

  // For common method
  describe('New transactional message should have all common method', function() {
    [
      'setFrom',
      'addTo',
      'addCC',
      'addBCC',
      'setSubject',
      'setMessage',
      'addAttachment',
      'addAlternative',
      'setReplyTo',
      'setHeader',
      'setPriorityToHigh',
      'setPriorityToLow',
      'setPriorityToNormal',
      'raw',
      'setSubAccount',
    ].forEach(function (method) {
      it ([ 'Message should have', method, 'property and should be a function' ].join(' '), function () {
        m.should.have.property(method);
        m[method].should.to.be.a('function');
      });
    })
  });

  // for internal needed method
  describe('New transactional message should have some common internal method', function() {
    [
      'setPriority',
      'prepare',
      'prepareLastOperations',
      'addKey',
      'set',
    ].forEach(function (method) {
      it ([ 'Message should have', method, 'property and should be a function' ].join(' '), function () {
        m.should.have.property(method);
        m[method].should.to.be.a('function');
      });
    })
  });

  // for internal needed module
  describe('New transactional message should have some common internal modules', function() {
    [
      'schema',
      'transformers',
      'checker',
      'converter',
    ].forEach(function (method) {
      it ([ 'Message should have', method, 'property and should be an object' ].join(' '), function () {
        m.should.have.property(method);
        m[method].should.to.be.a('object');
      });
    })
  });

  /**
   * Build part define here need data to process next test
   */

  // default message build
  describe('New transactional message build should succeed/failed on these cases', function() {
    [
      { name : 'setFrom', args : [ 'technique@yocto.re' ], result : true, count : 2, property : 'from' },
      { name : 'setFrom', args : [ 'invalid email' ], result : false, count : 2, property : 'from' },
      { name : 'addTo', args : [ 'to@yocto.re' ], result : true, count : 1, property : 'to' },
      { name : 'addTo', args : [ { address : 'to2@yocto.re' } ], result : true, count : 2, property : 'to' },
      { name : 'addTo', args : [ { address : 'to3@yocto.re', name : 'to3' } ], result : true, count : 3, property : 'to' },
      { name : 'addCC', args : [ 'cc@yocto.re' ], result : true, count : 1, property : 'cc' },
      { name : 'addCC', args : [ { address : 'cc2@yocto.re' } ], result : true, count : 2, property : 'cc' },
      { name : 'addCC', args : [ { address : 'cc3@yocto.re', name : 'c3' } ], result : true, count : 3, property : 'cc' },
      { name : 'addBCC', args : [ 'bcc@yocto.re' ], result : true, count : 1, property : 'bcc' },
      { name : 'addBCC', args : [ { address : 'bcc2@yocto.re' } ], result : true, count : 2, property : 'bcc' },
      { name : 'addBCC', args : [ { address : 'bcc3@yocto.re', name : 'bcc3' } ], result : true, count : 3, property : 'bcc' },
      { name : 'setSubject', args : [ 'My Subject' ], result : true, count : 1, property : 'subject' },
      { name : 'setMessage', args : [ 'My Message' ], result : true, count : 1, property : 'text' },
      { name : 'setMessage', args : [ '<b>My Message </b>' ], result : true, count : 1, property : 'html' },
      { name : 'addAttachment', args : [ './README.md' ], result : true, count : 1, property : 'attachments' },
      { name : 'addAlternative', args : [ './Gruntfile.js' ], result : true, count : 1,  property : 'alternatives' },
      { name : 'setReplyTo', args : [ 'reply-to@yocto.re' ], result : true, count : 1,  property : 'replyTo' },
      { name : 'setHeader', args : [ { key : 'X-HEADER-1', value : 'X-HEADER-1-VALUE' } ], result : true, count : 1,  property : 'headers' },
      { name : 'setHeader', args : [ { key : 'X-HEADER-2', value : 'X-HEADER-2-VALUE' } ], result : true, count : 2,  property : 'headers' },
      { name : 'setHeader', args : [ { key : 'X-HEADER-3', value : 'X-HEADER-3-VALUE' } ], result : true, count : 3,  property : 'headers' },
      { name : 'setPriority', args : [ 'low' ], result : true, count : 1,  property : 'priority' },
      { name : 'setPriorityToHigh', result : true, count : 1, property : 'priority' },
      { name : 'setPriorityToLow', result : true, count : 1, property : 'priority' },
      { name : 'setPriorityToNormal', result : true, count : 1, property : 'priority' },
      { name : 'setSubAccount', args : [ 'test' ], result : true, count : 1,  property : 'subaccount' }
    ].forEach(function (method) {
      it ([ 'Using method', method.name, 'should', method.result ? 'succeed' : 'failed', 'and have a size of', method.count, 'with arguments :', utils.obj.inspect(method.args) ].join(' '), function () {
        var r = m[method.name].apply(m, method.args || []);
        // test
        r.should.be.equal(method.result);
        // try to prepare object
        m.message.should.have.property(method.property);

        // get property
        var p = _.get(m.message, method.property);
        var pSize = _.size(p);
        var cSize = _.isString(p) ? (_.first(method.args) ? _.size(_.first(method.args)) : pSize) : method.count;
        // test size length
        pSize.should.equal(cSize);
      });
    })
  });
  // to test transformation process
  describe('New transactional message build for nodemailer/mandrill must be on correct format', function() {
    it ('Message must be an object and not empty for nodemailer', function () {
      var prepared = m.prepare();
      prepared.should.be.an('object');
      prepared.should.be.not.empty;      
      var messageFormat = prepared.toNodeMailer().toObject();
      messageFormat.should.be.an('object');
      messageFormat.should.be.not.empty;
    });
    it ('Message must be an object and not empty for mandrill', function () {
      var prepared = m.prepare();
      prepared.should.be.an('object');
      prepared.should.be.not.empty;      
      var messageFormat = prepared.toMandrill().toObject();
      messageFormat.should.be.an('object');
      messageFormat.should.be.not.empty;   
    });
  });
  // to test if after transformation property is correct for current message format 
  describe('New transactional message build should properly transform for nodemailer format', function() {
    [
      'from',
      'to',
      'cc',
      'bcc',
      'subject',
      'text',
      'html',
      'attachments',
      'alternatives',
      'replyTo',
      'headers',
      'priority',
      'subaccount'
    ].forEach(function (property) {
      it ([ 'Message must contains', property, 'property and not be empty' ].join(' '), function () {
        var prepared = m.prepare().toNodeMailer().toObject();
        prepared.should.have.nested.property(property);
        var value = _.get(prepared, property);
        value.should.be.not.empty;
      });
    })
  });
  // to test if after transformation property is correct for current message format 
  describe('New transactional message build should properly transform for Mandrill format', function() {
    [
      'from_email',
      'to',
      'subject',
      'text',
      'html',
      'attachments',
      'headers',
      'headers.Reply-To',
      'important',
      'subaccount'
    ].forEach(function (property) {
      it ([ 'Message must contains', property, 'property and not be empty' ].join(' '), function () {
        var prepared = m.prepare().toMandrill().toObject();
        //console.log(prepared);
        prepared.should.have.nested.property(property);
        //var value = _.get(prepared, property);
        //value.should.be.not.empty;
      });
    })
  });

  // to test if after transformation property is correct for current message format 
  describe('New transactional message build should properly transform for Mailjet format', function() {
    [
      { name : 'From', level : 1 },
      { name : 'To', level : 1 },
      { name : 'Cc', level : 1 },
      { name : 'Bcc', level : 1 },
      { name : 'Subject', level : 1 },
      { name : 'TextPart', level : 1 },
      { name : 'HTMLPart', level : 1 },
      { name : 'Attachments', level : 1 },
      { name : 'ReplyTo', level : 1 },
      { name : 'Headers', level : 1 },
      { name : 'Priority', level : 1 },
      { name : 'SandboxMode', level : 0 }
    ].forEach(function (property) {
      it ([ 'Message must contains', property.name, 'property and not be empty' ].join(' '), function () {
        var prepared = m.prepare().toMailjet().toObject();
        var inside   = _.first(_.get(prepared, 'Messages'));

        prepared.should.be.an('object');
        prepared.Messages.should.be.an('array');

        if (property.level === 1) {
          inside.should.have.nested.property(property.name);
        }

        if (property.level === 0) {
          prepared.should.have.nested.property(property.name);
        }
      });
    })
  });

  // to test if after transformation property is correct for current message format 
  describe('New transactional message should properly sent for all defined provider', function() {
    // we need to force the timeout
    this.timeout(30000);

    // node mailer
    it ('Message should be sent for nodemailer', function (done) {
      var options = {
        host    : process.env.SMTP_HOST,
        port    : process.env.SMTP_PORT,
        secure  : false,
        auth    : {
            user  : process.env.SMTP_AUTH_USER,
            pass  : process.env.SMTP_AUTH_PASS
        }
      };

      // try to send
      var prepared = m.prepare().toNodeMailer().send(options).then(function (success) {
        success.should.be.an('object');
        success.should.have.property('response');
        success.should.have.property('stats');
        success.should.have.nested.property('response.accepted');
        success.should.have.nested.property('response.rejected');
        success.should.have.nested.property('response.response');
        success.should.have.nested.property('response.envelope');
        success.should.have.nested.property('response.messageId');
        done();
      }).catch(function(error) {
        assert.isNotOk(false, 'Cannot connect on current server' + error);
        done();
      });
    });

    // mandrill
    it ('Message should be sent for mandrill', function (done) {
      // current apiKey
      var options = process.env.MANDRILL_API_KEY;

      // try to send
      var prepared = m.prepare().toMandrill().send(options).then(function (success) {
        success.should.be.an('object');
        success.should.have.property('response');
        success.should.have.property('stats');
        done();
      }).catch(function(error) {
        assert.isNotOk(false, 'Cannot connect on current server' + error);
        done();
      });
    });

    // mailjet
    it ('Message should be sent for mailjet', function (done) {
      // current apiKey
      var options = {
        publicKey  : process.env.MJ_APIKEY_PUBLIC,
        privateKey : process.env.MJ_APIKEY_PRIVATE
      };

      // we must enable sandbox mode
      m.enableSandbox();

      // try to send
      var prepared = m.prepare().toMailjet().send(options).then(function (success) {
        success.should.be.an('object');
        success.should.have.property('response');
        success.should.have.property('stats');
        done();
      }).catch(function(error) {
        done(new Error('Cannot sent email with mailjet transporter : ' + error.response.response.text));
      });
    });
  });
});