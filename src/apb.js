#!/usr/bin/env node
'use strict';

var program = require('commander');
var lib = require('./lib.js');

// Check for the project updates
var notifier = require('update-notifier')({
    pkg: require('../package.json'),
    updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
});
notifier.notify();

// Program definition
program
    .version(require('../package.json').version)
    .usage('<command> [<args>] [options]'.green)
    .description((require('../package.json').description).blue)
    .command('login', 'Login into the platform')
    .command('whoami', 'answers if you are logged or not and who are you')
    .command('build', 'send the current project to The Builder')
    .command('status <id>', 'check the status of the build <id>')
    .command('log <id>', 'retrieve the logs of the build <id>')
    .command('download <id>', 'download the artifacts for the build <id>')
    .command('config <key> <value>', 'configure options on the client. Pass the key-value as arguments. Pass only the key for showing the value')
    .command('logout', 'Logout from the platform')
    .parse(process.argv);

// Unknown commands
var found = 0;
program.commands.forEach(function (command) {
    program.args.forEach(function (arg) {
        if (command._name === arg) {
            found = 1;
        }
    });
});

if (!found) {
    lib.log('error', 'Sub-command not found.');
    lib.exit(1);
}
