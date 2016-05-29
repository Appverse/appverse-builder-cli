'use strict';

var common = require('./../common.js');
var whoami = require('../../src/impl/apb-whoami-impl.js');
var lib = common.lib;

it('WHOAMI should be executed without errors', function (done) {

    // It's not necessary to create the items, we mocked in the test.js
    //lib.setUserConfig('access_token', '1234567890');
    //lib.setUserConfig('whoami', 'foo');
    whoami.run({}, lib, function() {
        done();
    });
});
