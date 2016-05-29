'use strict';

var common = require('./common.js');
var fs = common.fs;
var mock = common.mock;

describe('CLI tests', function () {

    this.timeout(common.timeout);


    beforeEach(function (done) {

        // Configure mock filesystem
        mock({
            'src/.userConfig': {
                'access_token': '1234567890',
                'whoami': 'foo'
            },
            'src/.config': {
                'endpoint': 'http://www.foo.bar/',
                'configFile': 'config.yml',
                'ignoreFile': 'ignoreFile',
                'client-id': 'client-id',
                'client-secret': 'client-secret'
            },
            'build': {
                'config.yml': fs.readFileSync('./test/mock/config.yml')
            },
            'build.zip': fs.readFileSync('./test/mock/build.zip'),
            'artifacts.zip': fs.readFileSync('./test/mock/artifacts.zip'),
            'payload.json': fs.readFileSync('./test/mock/payload.json'),
            'token.json': fs.readFileSync('./test/mock/token.json'),
            'buildRequest.json': fs.readFileSync('./test/mock/buildRequest.json')
        }, {
            createTmp: true
        });

        done();
    });

    common.importTest('bin tests', './bin/apb-bin.js');
    common.importTest('help tests', './bin/apb-help.js');
    common.importTest('version tests', './bin/apb-version.js');

    common.importTest('login tests', './api/apb-login.js');
    common.importTest('whoami tests', './api/apb-whoami.js');
    common.importTest('config tests', './api/apb-config.js');
    common.importTest('build tests', './api/apb-build.js');
    common.importTest('status tests', './api/apb-status.js');
    common.importTest('log tests', './api/apb-log.js');
    common.importTest('download tests', './api/apb-download.js');
    common.importTest('logout tests', './api/apb-logout.js');

    // TODO: Create test for integration test (bin execution) for the whole process

    afterEach(function (done) {
        mock.restore();
        done();
    });

});
