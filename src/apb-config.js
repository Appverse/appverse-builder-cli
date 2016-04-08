'use strict';

var program = require('commander');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('config <key> [value] [options]'.green)
    .description('Configure options on the client. Pass the key-value as arguments. Pass only the key for showing the value'.blue)
    .option('-l, --list', 'list all configured options')
    .option('-d, --debug', 'enable debug mode')
    .parse(process.argv);

lib.debugLevel(program.debug);
lib.validateArgsVariable(program, [0,1,2]);

// -------------------------------------------------------------------------------------------
// Config process
// -------------------------------------------------------------------------------------------

require('./impl/apb-config-impl.js').run(program, lib, function () {
    lib.exit(0);
});
