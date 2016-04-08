'use strict';

var common = require('../common.js');
var assert = common.assert;
var exec = common.exec;

it('should return error on unknown command', function (done) {
    exec(common.cmd + 'junkcmd', function (error) {
        assert(error);
        assert.equal(error.code, 1);
        done();
    });
});
