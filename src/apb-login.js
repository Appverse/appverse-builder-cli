'use strict';

var program = require('commander');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('login [options]'.green)
    .description('Login into the platform'.blue)
    .option('-d, --debug', 'enable debug mode')
    .option('-u, --username [username]', 'username, if is not set will be prompted to introduce it')
    .option('-p, --password [password]', 'password, if is not set will be prompted to introduce it')
    .parse(process.argv);

lib.debugLevel(program.debug);

// -------------------------------------------------------------------------------------------
// Login process
// -------------------------------------------------------------------------------------------

require('./impl/apb-login-impl.js').run(program, lib, function (response, username) {
    lib.setUserConfig('access_token', response);
    lib.setUserConfig('whoami', username);
    lib.log('info', 'You\'ve successfully logged!');
    lib.exit(0);
});
