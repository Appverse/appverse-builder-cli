'use strict';

var program = require('commander');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('logout [options]'.green)
    .description('Logout from the platform'.blue)
    .option('-d, --debug', 'enable debug mode')
    .parse(process.argv);

lib.debugLevel(program.debug);

// -------------------------------------------------------------------------------------------
// Logout process
// -------------------------------------------------------------------------------------------

require('./impl/apb-logout-impl.js').run(program, lib, function () {
    lib.removeUserConfig('access_token');
    lib.removeUserConfig('whoami');
    lib.exit(0);
});
