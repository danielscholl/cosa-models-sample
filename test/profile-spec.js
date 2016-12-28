/* eslint-disable no-unused-vars */
'use strict';
const should    = require('chai').Should();

// Create an Array with all models so they can be cleaned up prior to each test.
const q         = require('q');
const db        = require('cosa').db;
const models    = require('../lib/index');
let modelList   = [];

Object.keys(models).forEach((key) => {
  var model = models[key];

  if(model.remove) {
    modelList.push(() => { return model.remove({}, { multiple: true }); }); 
  }
});

before((done) => {
  db.init().then(() => { done(); }).done();
});

beforeEach((done) => {
  q.allSettled(modelList.map((f) => { return f(); })).then(() => { done(); });
});


///////////////  TEST CASES
const moment    = require('moment');
const ObjectID  = require('bson').ObjectID;
const Profile = require('../lib').Profile;

describe('Models', () => {
  let tsUser = {
    id: '30f1868d-7a22-6884-fd2d-b41121afb0cc'
  };
  let tsToken = { 
    token: 'NDgzMTBiM2YtMTk2OC00NDc4LTlhMWItMDBiZDA0MTNkODk2',
    created_at: '2016-12-27T16:46:41.014392604Z',
    expires_in: 2592000
  };

  describe('Profile Model', () => {
    it('should save a key correctly, and get expire date', (done) => {
      Profile.init(tsUser, tsToken)
        .then((p) => {
          p.userid.should.equal(tsUser.id);
          p.key.should.equal(tsToken.token);
          p.expire.should.be.a.date;
          done(); })
        .done(null, done);
    });
    it('should allow profile to be refreshed', (done) => {
      let newToken = { 
        token: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        created_at: '2016-12-28T16:46:41.014392604Z',
        expires_in: 2592000
      };

      Profile.init(tsUser, tsToken)
        .then(() => {
          return Profile.refresh(tsUser, newToken); })
        .then((doc) => {
          should.exist(doc);
          doc.key.should.equal(newToken.token);
          doc.expires.should.equal(newToken.expires_in);
          done(); })
        .done(null, done);
    });

    it('should allow a profile to be retrieved by UserId', (done) => {
      Profile.init(tsUser, tsToken)
        .then((p) => {
          return Profile.byUser(tsUser); })
        .then((doc) => {
          should.exist(doc);
          String(doc._id).should.exist;
          doc.key.should.equal(tsToken.token);
          done();
        })
        .done(null, done);
    });

    it('should allow a profile to be retrieved by Id', (done) => {
      Profile.init(tsUser, tsToken)
        .then((p) => {
          return Profile.byId(p._id); })
        .then((doc) => {
          should.exist(doc);
          String(doc._id).should.exist;
          doc.key.should.equal(tsToken.token);
          done();
        })
        .done(null, done);
    });
  });

  describe('Working With Cosa Models', () => {
    let args = {
      userid: '30f1868d-7a22-6884-fd2d-b41121afb0cc',
      key: 'NDgzMTBiM2YtMTk2OC00NDc4LTlhMWItMDBiZDA0MTNkODk2', 
    };

    it('validation should pass with valid args', done => {
      Profile.create(args).validate()
        .then((doc) => {
          should.exist(doc);
          doc.userid.should.equal(args.userid);
          done();
        }, (err) => {
          should.not.exist(err);
          done(); })
        .done(null, done);
    });

    it('validation should fail with missing args', done => {
      Profile.create({}).validate()
        .then((doc) => {
          should.not.exist(doc);
          done();
        }, (err) => {
          should.exist(err);
          err.statusCode.should.equal(400);
          done(); })
        .done(null, done);
    });
    it('validation should fail with extra args', done => {
      let copy = Object.assign({}, args);
      copy.more = 'MoreStuff';

      Profile.create(copy).validate()
        .then((doc) => {
          should.not.exist(doc);
          done();
        }, (err) => {
          should.exist(err);
          done(); })
        .done(null, done);
    });

    it('validation should pass with optional args', done => {
      let copy = Object.assign({}, args);
      copy.expires = 12345;

      Profile.create(copy).validate()
        .then((doc) => {
          doc.should.exist;
          doc.expires.should.equal(copy.expires);
          done();
        }, (err) => {
          should.not.exist(err);
          done(); })
        .done(null, done);
    });

    it('should return null if no document is found', (done) => {
      Profile
        .findOne({ _id: 'asdfasdfasdf' })
        .then(function (doc) {
          should.not.exist(doc);
          done(); })
        .done(null, done);
    });

    it('should allow a profile to be retrieved by Profile id', (done) => {
      Profile.init(tsUser, tsToken)
        .then((p) => {
          return Profile.findOne({ _id: new ObjectID(String(p._id)) }); })
        .then((doc) => {
          should.exist(doc);  
          doc.key.should.equal(tsToken.token);   
          done(); })
        .done(null, done);
    });



    it('should allow a profile to be updated', (done) => {
      let newKey = 'AAbbCCCiM2YtMTk2OC00NDc4LTlhMWItMDBiZDA0MTNkODk3';

      Profile.init(tsUser, tsToken)
        .then((p) => {
          return Profile.update({ userId: p.id }, { key: newKey}); })
        .then((result) => {
          should.exist(result);
          result.matchedCount.should.equal(1);
          result.modifiedCount.should.equal(1);
          done(); })
        .done(null, done);
    });
  });
});