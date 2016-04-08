'use strict';

var program = require('commander');
var sleep = require('sleep');
var path = require('path');
var lib = require('./lib.js');

lib.setFileSystem(require('graceful-fs'));

// -------------------------------------------------------------------------------------------
// Program definition and arguments validation
// -------------------------------------------------------------------------------------------

program
    .alias('apb'.green)
    .usage('build [options]'.green)
    .description('Build the current (pwd) project into The builder. Command for zipping the actual folder and send it to the main builder.'.blue)
    .option('-d, --debug', 'enable debug mode')
    .option('-c --continuous', 'enable continuous build (build > logs > download)')
    .option('--folder [folder]', 'change the build folder. Default: pwd')
    .option('--token [token]', 'authorization token')
    .option('-f --flavor [flavor]', 'Select only one flavor to build. Flavor name must be unique.')
    .option('-e, --env key=value', 'custom environmental variables')
    .parse(process.argv);

lib.debugLevel(program.debug);
if (!program.token) {
    lib.checkLogged();
}

// Parse the environmental variables as options (-e key=value)
if (program.env) {
    var envVars = {};
    lib.log('debug', 'Program arguments: ' + program.args);
    program.args.forEach(function (arg) {
        var values = arg.split('=');
        envVars[values[0]] = values[1];
    });
    lib.log('debug', 'Environmental options: ' + JSON.stringify(envVars));
    program.envVars = envVars;
}

// -------------------------------------------------------------------------------------------
// Build process
// -------------------------------------------------------------------------------------------

require('./impl/apb-build-impl.js').run(program, lib, function (response) {

    if (program.continuous) {

        lib.log('debug', 'Continuous Mode enabled!');

        var count = 0, limit = 100;
        var id = response.requests[0].id;
        var status = response.requests[0].status;

        sleep.sleep(1);

        // We have to wait for a non waiting status or the waiting limit exceeded
        while (lib.isWaitingStatus(status) && count < limit) {

            sleep.sleep(2);
            status = require('./impl/apb-status-impl.js').runsync(program, lib, id);
            count++;
            lib.log('info', 'Waiting for the build start. Iteration (' + count + '): ' + status);
        }

        // If the waiting was ended by the limit counter...
        if (count === limit) {
            lib.log('error', 'The actual build is not starting... Please contact with your administrator');
            lib.exit(1);
        }

        if (lib.isValidStatus(status)) {

            lib.log('debug', 'status:' + status);

            // Printing the logs
            require('./impl/apb-log-impl.js').run(program, lib, id, function () {

                // After the logs, check the status until is finished
                sleep.sleep(1);

                while (lib.isRunningStatus(status) && count < limit) {

                    sleep.sleep(2);
                    status = require('./impl/apb-status-impl.js').runsync(program, lib, id);
                    count++;
                    lib.log('info', 'Waiting for the build finish. Iteration (' + count + '): ' + status);
                }

                // If the waiting was ended by the limit counter...
                if (count === limit) {
                    lib.log('error', 'The actual build is not finishing... Please contact with your administrator');
                    lib.exit(1);
                }

                // Showing the status
                require('./impl/apb-status-impl.js').run(program, lib, id, function (status) {

                    program.zip = true;
                    program.folder = path.join(program.folder || '.', 'build');
                    // Downloading the artifacts
                    require('./impl/apb-download-impl.js').run(program, lib, id, function () {
                        if (lib.isValidStatus(status)) {
                            lib.exit(0);
                        } else {
                            lib.log('error', 'The actual build finished with an error. Please review the logs');
                            lib.exit(1);
                        }
                    });
                });
            });

        } else {

            // The build is not started. Prompt an error and the logs

            lib.log('error', 'The actual build request is not started. Please review the logs');

            require('./impl/apb-log-impl.js').run(program, lib, id, function () {

                // Showing the status
                require('./impl/apb-status-impl.js').run(program, lib, id, function () {

                    lib.exit(1);
                });
            });
        }

    } else {
        // The continuous mode is not enabled, just skipping
        lib.exit(0);
    }
});
