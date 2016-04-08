'use strict';

var common = require('../common.js');
var assert = common.assert;
var exec = common.exec;

it('--version should run without errors', function (done) {
    exec(common.cmd + '--version', function (error) {
        assert(!error);
        done();
    });
});

it('-V should run without errors', function (done) {
    exec(common.cmd + '-V', function (error) {
        assert(!error);
        done();
    });
});
