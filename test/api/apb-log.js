'use strict';

var common = require('./../common.js');
var log = require('../../src/impl/apb-log-impl.js');
var lib = common.lib;
var fs = common.fs;
var nock = common.nock;

it('LOG should print the log into stdout', function (done) {

    nock(fs.readFileSync('src/.config/endpoint', {encoding: 'utf-8'}))
        .get('/api/buildRequests/1/log')
        .reply(200, 'This is the log\n');

    log.run({}, lib, '1', function () {
        done();
    });
});
