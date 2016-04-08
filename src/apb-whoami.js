'use strict';

var program = require('commander');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('whoami [options]'.green)
    .description('Answers if you are logged or not and who are you'.blue)
    .option('-d, --debug', 'enable debug mode')
    .parse(process.argv);

lib.debugLevel(program.debug);

// -------------------------------------------------------------------------------------------
// WhoAmI process
// -------------------------------------------------------------------------------------------

require('./impl/apb-whoami-impl.js').run(program, lib, function () {
    lib.exit(0);
});
