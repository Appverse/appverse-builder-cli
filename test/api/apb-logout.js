'use strict';

var common = require('./../common.js');
var lib = common.lib;

it('LOGOUT should be executed without errors', function (done) {

    // MARK: We can test the request because the request id done in sync and we can't mock the results

    lib.removeUserConfig('access_token');
    lib.removeUserConfig('whoami');

    done();
});
