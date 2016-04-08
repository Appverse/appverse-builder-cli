'use strict';

var lib = require('../src/lib.js');
lib.setLogLevel('warn');
lib.debugLevel(false);

var assert = require('assert');
var exec = require('child_process').exec;
var mock = require('mock-fs');
var nock = require('nock');
var fs = require('fs');

lib.setFileSystem(fs);

module.exports = {

    lib: lib,
    assert: assert,
    exec: exec,
    mock: mock,
    nock: nock,
    fs: fs,

    timeout: 10000,

    cmd: lib.getBinPath(),

    commands: [
        'login',
        'whoami',
        'logout',
        'config',
        'build',
        'status',
        'log',
        'download'],

    importTest: function (name, path) {
        describe(name, function () {
            require(path);
        });
    }

};
