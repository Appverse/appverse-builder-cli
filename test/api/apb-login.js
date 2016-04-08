'use strict';

var common = require('./../common.js');
var login = require('../../src/impl/apb-login-impl.js');
var lib = common.lib;
var fs = common.fs;
var nock = common.nock;
var assert = common.assert;

it('LOGIN should return a valid token', function (done) {

    nock(fs.readFileSync('src/.config/endpoint', {encoding: 'utf-8'}))
        .post('/oauth/token')
        .reply(200, fs.readFileSync('token.json', {encoding: 'utf-8'}));

    lib.removeUserConfig('access_token');
    login.run({
        username: 'foo',
        password: 'bar'
    }, lib, function (response, username) {
        assert.equal(username, 'foo', 'The username should be the same as provided');
        assert.equal(response, 'c38cfcc8-0749-406b-b4e7-819a44ddb40e', 'The token response should be the same as provided');
        done();
    });
});
