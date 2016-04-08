'use strict';

var path = require('path');
var glob = require('glob');

module.exports = {

    run: function (program, lib, callback) {

        if (program.args.length === 1) {

            // Query one parameter
            lib.log('info', lib.getConfig(program.args[0]));
            callback();

        } else if (program.args.length === 2) {

            // Set the parameter
            lib.setConfig(program.args[0], program.args[1]);
            callback();

        } else {

            if (program.list) {

                // List all the client configured options
                glob(lib.getConfigPath()+'/**/!(client-id|client-secret)', {dot: true}, function (er, files) {
                    files.forEach(function (entry) {

                        var key = path.basename(entry);
                        lib.log('info', key + ':\t ' + lib.getConfig(key));
                    });
                    callback();
                });

            } else {
                lib.log('error', 'The number of arguments is not correct');
                lib.exit(1);
            }
        }
    }
};
