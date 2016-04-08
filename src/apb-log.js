'use strict';

var program = require('commander');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('log <id> [options]'.green)
    .description('Tail the log of the build <id> to your screen'.blue)
    .option('-d, --debug', 'enable debug mode')
    .option('--token [token]', 'authorization token')
    .parse(process.argv);

lib.debugLevel(program.debug);
lib.validateArgs(program, 1);
if (!program.token) {
    lib.checkLogged();
}

// -------------------------------------------------------------------------------------------
// Log process
// -------------------------------------------------------------------------------------------

require('./impl/apb-log-impl.js').run(program, lib, program.args[0], function () {
    lib.exit(0);
});
