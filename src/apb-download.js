'use strict';

var program = require('commander');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('download <id> [options]'.green)
    .description('Download the artifacts for the build [id]. The artifacts can be located in the ./build/<id> folder'.blue)
    .option('-d, --debug', 'enable debug mode')
    .option('--token [token]', 'authorization token')
    .option('--folder [folder]', 'change the build output folder. Default: build')
    .parse(process.argv);

lib.debugLevel(program.debug);
lib.validateArgs(program, 1);
if (!program.token) {
    lib.checkLogged();
}

// -------------------------------------------------------------------------------------------
// Download process
// -------------------------------------------------------------------------------------------
program.zip = true;
require('./impl/apb-download-impl.js').run(program, lib, program.args[0], function () {
    lib.exit(0);
});
