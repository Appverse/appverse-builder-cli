'use strict';

// MARK: for the log request we are using a custom request because the output should be piped
var req = require('request');

module.exports = {

    run: function (program, lib, id, callback) {

        req.debug = program.debug;
        // Url manipulations
        lib.api.log.url = lib.getConfig('endpoint') + lib.api.log.url.replace('{id}', id);

        var token = program.token || lib.getUserConfig('access_token');
        lib.log('debug','token: ' + token);
        lib.api.log.headers.Authorization = 'Bearer ' + token;

        // Make the request and pipe the response to stdout
        req(lib.api.log)

            // When we receive the first chunk of the response
            .on('response', function (response) {
                lib.handleStatusCode(response, lib.api.log);
            })

            // Error generation the response
            .on('error', function (error) {
                lib.log('error', error + '');
                lib.exit(1);
            })

            // Every time we receive data
            .on('data', function (data) {
                if (lib.isLogPrintable()) {
                    process.stdout.write(data);
                }
            })

            // Every time we receive data
            .on('end', function () {
                lib.log('debug', 'end');
                callback();
            });

        // Pipe the response to stdout
        //.pipe(process.stdout);
    }
};
