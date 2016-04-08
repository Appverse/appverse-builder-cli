'use strict';

var common = require('./../common.js');
var whoami = require('../../src/impl/apb-whoami-impl.js');
var lib = common.lib;

it('WHOAMI should be executed without errors', function (done) {

    lib.setUserConfig('access_token', '1234567890');
    lib.setUserConfig('whoami', 'foo');
    whoami.run({}, lib, function () {
        done();
    });
});
