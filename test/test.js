/*!
 * level-revision-embed <https://github.com/doowb/level-revision-embed>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var LevelRevision = require('level-revision');
var LevelRevisionEmbed = require('../');

var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var assert = require('assert');
var async = require('async');
var level = require('level');
var path = require('path');

var dataPath = path.join(__dirname, '.data');
var dbPath = path.join(dataPath, '.test.db');

var _db = null;
var db = null;
describe('level-revision-embed', function () {
  beforeEach(function (done) {
    rimraf(dataPath, function (err) {
      if (err) return done(err);
      mkdirp.sync(dataPath);
      _db = level(dbPath);
      db = new LevelRevision(_db, { strategy: LevelRevisionEmbed });
      done();
    });
  });

  afterEach(function (done) {
    _db.close(function () {
      rimraf(dataPath, done);
    });
  });

  it('should put an item in the database', function (done) {
    db.put(['test-item-1'], { id: 'item-1', description: 'Item 1'}, function (err, item) {
      if (err) return done(err);
      assert(item != null, 'item should be valid');
      assert.equal(item.id, 'item-1');
      assert.equal(item.rev, 1);
      assert.deepEqual(item.revisions, [ { id: 'item-1', description: 'Item 1', rev: 1 }]);

      db.get(['test-item-1', 1], function (err, revision) {
        if (err) return done(err);
        assert(revision != null, 'revision should be valid');
        assert.deepEqual(revision, ['test-item-1']);
        done();
      });
    });
  });

  it('should update an item in the database', function (done) {
    db.put(['test-item-2'], { id: 'item-2', description: 'Item 2'}, function (err, item) {
      if (err) return done(err);
      item.description = 'Updated Item 2';
      db.put(['test-item-2'], item, function (err, item2) {
        if (err) return done(err);
        assert(item2 != null, 'item2 should be valid');
        assert.equal(item2.id, 'item-2');
        assert.equal(item2.rev, 2);
        assert.deepEqual(item2.revisions, [
          { id: 'item-2', description: 'Item 2', rev: 1},
          { id: 'item-2', description: 'Updated Item 2', rev: 2}
        ]);
        db.get(['test-item-2'], function (err, item3) {
          if (err) return done(err);
          assert(item3 != null, 'item3 should be valid');
          assert.equal(item3.id, 'item-2');
          assert.equal(item3.rev, 2);
          assert.deepEqual(item3.revisions, [
            { id: 'item-2', description: 'Item 2', rev: 1},
            { id: 'item-2', description: 'Updated Item 2', rev: 2}
          ]);
          done();
        });
      });
    });
  });
});

