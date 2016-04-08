'use strict';

var common = require('../common.js');
var assert = common.assert;
var exec = common.exec;

it('--help should run without errors', function (done) {
    exec(common.cmd + '--help', function (error) {
        assert(!error);
        done();
    });
});

it('--h should run without errors', function (done) {
    exec(common.cmd + '-h', function (error) {
        assert(!error);
        done();
    });
});

it('help should run without errors', function (done) {
    exec(common.cmd + 'help', function (error) {
        assert(!error);
        done();
    });
});

it('should return help on missing command', function (done) {
    exec(common.cmd, function (error) {
        assert(!error);
        done();
    });
});

common.commands.forEach(function (command) {

    it('should return help for ' + command, function (done) {
        exec(common.cmd + ' help ' + command, function (error) {
            assert(!error);
            done();
        });
    });
});
