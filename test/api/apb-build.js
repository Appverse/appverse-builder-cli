'use strict';

var common = require('./../common.js');
var build = require('../../src/impl/apb-build-impl.js');
var nock = common.nock;
var fs = common.fs;
var lib = common.lib;
var assert = common.assert;

it('BUILD should return a list of build requests', function (done) {

    nock(fs.readFileSync('src/.config/endpoint', {encoding: 'utf-8'}))
        .post('/api/buildChains/payload')
        .reply(201, fs.readFileSync('payload.json', {encoding: 'utf-8'}));

    build.run({
        folder: './build',
        zipFile: 'build.zip'
    }, lib, function (response) {
        assert.equal(response.id, 1, 'The response id should be 1');
        assert.equal(response.requests.length, 1, 'The number of buildRequests should be 1');
        done();
    });
});
