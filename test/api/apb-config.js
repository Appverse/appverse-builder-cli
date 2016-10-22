'use strict';

var common = require('./../common.js');
var config = require('../../src/impl/apb-config-impl.js');
var lib = common.lib;

/*
In testing with mock-fs the config write is not working
it('CONFIG (arg, arg) should configure a config value into the system', function (done) {

    config.run({
        args: ['key', 'value']
    }, lib, function () {
        done();
    });
});*/

it('CONFIG (client-id) should return a value', function (done) {

    config.run({
        args: ['client-id']
    }, lib, function () {
        done();
    });
});

it('CONFIG (client-secret) should return a value', function (done) {

    config.run({
        args: ['client-secret']
    }, lib, function () {
        done();
    });
});

it('CONFIG (configFile) should return a value', function (done) {

    config.run({
        args: ['configFile']
    }, lib, function () {
        done();
    });
});

it('CONFIG (endpoint) should return a value', function (done) {

    config.run({
        args: ['endpoint']
    }, lib, function () {
        done();
    });
});

it('CONFIG (ignoreFile) should return a value', function (done) {

    config.run({
        args: ['ignoreFile']
    }, lib, function () {
        done();
    });
});

it('CONFIG (log-retries) should return a value', function (done) {

    config.run({
        args: ['log-retries']
    }, lib, function () {
        done();
    });
});

it('CONFIG (list) should return the list of configured values', function (done) {

    config.run({
        args: [],
        list: true
    }, lib, function () {
        done();
    });
});
