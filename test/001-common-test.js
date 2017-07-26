var logger  = require('yocto-logger');
var message = require('../dist/index.js')(logger);
var assert = require('assert');
var _      = require('lodash');
var utils  = require('yocto-utils');
var should = require('chai').should();

// disable console we dont need it
message.logger.disableConsole();

// create a new message
var m = message.new();

describe('Message ()', function() {
  describe('New message should be valid and type of object', function() {
    it ('Message should be an object', function () {
      m.should.to.be.a('object');
    });
    it ('Message should be not empty', function () {
      m.should.not.be.empty;
    });
  });

  // For common method
  describe('New message should have all common method', function() {
    [
      'setFrom',
      'addTo',
      'addCC',
      'addBCC',
      'setSubject',
      'setMessage',
      'addAttachement',
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
  describe('New message should have some common internal method', function() {
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
  describe('New message should have some common internal modules', function() {
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
  describe('New message build should succeed/failed on these cases', function() {
    [
      { name : 'setFrom', args : [ 'from@test.com' ], result : true, count : 2, property : 'from' },
      { name : 'setFrom', args : [ 'from2@test.com', 'from2Enveloppe@test.com' ], result : true, count : 2, property : 'from' },
      { name : 'setFrom', args : [ 'invalid email' ], result : false, count : 2, property : 'from' },
      { name : 'addTo', args : [ 'to@test.com' ], result : true, count : 1, property : 'to' },
      { name : 'addTo', args : [ { address : 'to2@test.com' } ], result : true, count : 2, property : 'to' },
      { name : 'addTo', args : [ { address : 'to3@test.com', name : 'to3' } ], result : true, count : 3, property : 'to' },
      { name : 'addCC', args : [ 'cc@test.com' ], result : true, count : 1, property : 'cc' },
      { name : 'addCC', args : [ { address : 'cc2@test.com' } ], result : true, count : 2, property : 'cc' },
      { name : 'addCC', args : [ { address : 'cc3@test.com', name : 'c3' } ], result : true, count : 3, property : 'cc' },
      { name : 'addBCC', args : [ 'bcc@test.com' ], result : true, count : 1, property : 'bcc' },
      { name : 'addBCC', args : [ { address : 'bcc2@test.com' } ], result : true, count : 2, property : 'bcc' },
      { name : 'addBCC', args : [ { address : 'bcc3@test.com', name : 'bcc3' } ], result : true, count : 3, property : 'bcc' },
      { name : 'setSubject', args : [ 'My Subject' ], result : true, count : 1, property : 'subject' },
      { name : 'setMessage', args : [ 'My Message' ], result : true, count : 1, property : 'text' },
      { name : 'setMessage', args : [ '<b>My Message </b>' ], result : true, count : 1, property : 'html' },
      { name : 'addAttachement', args : [ './README.md' ], result : true, count : 1, property : 'attachements' },
      { name : 'addAlternative', args : [ './Gruntfile.js' ], result : true, count : 1,  property : 'alternatives' },
      { name : 'setReplyTo', args : [ 'reply-to@test.com' ], result : true, count : 1,  property : 'replyTo' },
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
  describe('New message build for nodemailer/mandrill must be on correct format', function() {
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
  describe('New message build should properly transform for nodemailer format', function() {
    [
      'from',
      'to',
      'cc',
      'bcc',
      'subject',
      'text',
      'html',
      'attachements',
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
  describe('New message build should properly transform for Mandrill format', function() {
    [
      'from.address',
      'to',
      'subject',
      'text',
      'html',
      'attachements',
      'headers',
      'headers.Reply-To',
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
  describe('New message should properly sent for nodemaler/mandrill format', function() {
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
        success.should.have.property('accepted');
        success.should.have.property('rejected');
        success.should.have.property('response');
        success.should.have.property('envelope');
        success.should.have.property('messageId');
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
        success.should.be.an('array');
        success.should.be.not.empty;
        done();
      }).catch(function(error) {
        assert.isNotOk(false, 'Cannot connect on current server' + error);
        done();
      });
    });
  });
});