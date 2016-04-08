'use strict';

var common = require('./../common.js');
var download = require('../../src/impl/apb-download-impl.js');
var lib = common.lib;
var fs = common.fs;
var nock = common.nock;

it('DOWNLOAD should return a zip file', function (done) {

    nock(fs.readFileSync('src/.config/endpoint', {encoding: 'utf-8'}))
        .get('/api/buildRequests/1/artifacts/compressed')
        .replyWithFile(200, './artifacts.zip');

    download.run({}, lib, '1', function () {
        done();
    });

});
