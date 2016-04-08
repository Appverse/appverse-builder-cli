#!/usr/bin/env node
'use strict';
/**
 * Created by administrator on 30/03/16.
 *
 * Script for re-branding the entire client
 *
 * usage: node brand <new-brand> [old-brand]
 */

var program = require('commander');
var replace = require('replace');
var shell = require('shelljs');

var cmdBrand;
var cmdOldBrand;

program
    .version('0.0.1')
    .arguments('<brand> <oldBrand>')
    .action(function (brand, oldBrand) {
        cmdBrand = brand;
        cmdOldBrand = oldBrand;
    })
    .parse(process.argv);

if (typeof cmdBrand === 'undefined') {
    console.error('You should define a <brand>');
    process.exit(1);
}
if (typeof cmdOldBrand === 'undefined') {
    console.error('You should define a <oldBrand>');
    process.exit(1);
}

console.log('Executing script for rebranding with new brand <' + cmdBrand + '> replacing <' + cmdOldBrand + '>');
console.log('-------------------------------------------------------------------------------------------');

// README.md & package.json
replace({
    regex: cmdOldBrand,
    replacement: cmdBrand,
    paths: ['README.md', 'package.json'],
    recursive: false,
    silent: false
});

// Rename config files
shell.mv('.' + cmdOldBrand + '.yml', '.' + cmdBrand + '.yml');
shell.mv('.' + cmdOldBrand + 'ignore', '.' + cmdBrand + 'ignore');

// Config files
try {
    replace({
        regex: cmdOldBrand,
        replacement: cmdBrand,
        paths: ['src/.config/configFile'],
        recursive: false,
        silent: false
    });
    replace({
        regex: cmdOldBrand,
        replacement: cmdBrand,
        paths: ['src/.config/ignoreFile'],
        recursive: false,
        silent: false
    });
} catch (e) {
    console.log('There are no config files');
}

// Source files
replace({
    regex: cmdOldBrand,
    replacement: cmdBrand,
    paths: ['src'],
    exclude: 'src/.config',
    recursive: true,
    silent: false
});

shell.ls('src/' + cmdOldBrand + '*.js').forEach(function (file) {
    shell.mv(file, file.replace(cmdOldBrand, cmdBrand));
});
shell.ls('src/impl/' + cmdOldBrand + '*.js').forEach(function (file) {
    shell.mv(file, file.replace(cmdOldBrand, cmdBrand));
});


// Test files
replace({
    regex: cmdOldBrand,
    replacement: cmdBrand,
    paths: ['test'],
    recursive: true,
    silent: false
});
shell.ls('test/api/' + cmdOldBrand + '*.js').forEach(function (file) {
    shell.mv(file, file.replace(cmdOldBrand, cmdBrand));
});
shell.ls('test/bin/' + cmdOldBrand + '*.js').forEach(function (file) {
    shell.mv(file, file.replace(cmdOldBrand, cmdBrand));
});
