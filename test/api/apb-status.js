'use strict';

var common = require('./../common.js');
var status = require('../../src/impl/apb-status-impl.js');
var lib = common.lib;
var fs = common.fs;
var nock = common.nock;
var assert = common.assert;

it('STATUS (async) should return a FAILED status', function (done) {

    nock(fs.readFileSync('src/.config/endpoint', {encoding: 'utf-8'}))
        .get('/api/buildRequests/1')
        .reply(200, fs.readFileSync('buildRequest.json', {encoding: 'utf-8'}));

    status.run({}, lib, '1', function (response) {
        assert.equal(response, 'FAILED', 'The status should be failed');
        done();
    });

    // MARK: It not possible to test the sync request https://github.com/pgte/nock/issues/357
});
