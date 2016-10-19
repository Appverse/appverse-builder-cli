'use strict';

var program = require('commander');
//var sleep = require('sleep');
var path = require('path');
var lib = require('./lib.js');

var logCount = 1, logLimit = 5;

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

    lib.sleep(100);

    // We have to wait for a non waiting status (QUEUED) or the waiting limit exceeded
    while (lib.isWaitingStatus(status) && count < limit) {

      lib.sleep(100);
      status = require('./impl/apb-status-impl.js').runsync(program, lib, id);
      count++;
      if (lib.isWaitingStatus(status)) {
        lib.log('info', 'Waiting for the build start. Iteration (' + count + '): ' + status);
      }
    }

    // If the waiting was ended by the limit counter...
    if (count === limit) {
      lib.log('error', 'The actual build is not starting... Please contact with your administrator');
      lib.exit(1);
    }

    // We have to check if the status is valid (RUNNING, QUEUED, SUCCESSFUL)
    if (lib.isValidStatus(status)) {

      lib.log('debug', 'status:' + status);
      getLogs(id, status);

    } else {
      // The build is not started (CANCELLED, FAILED). Prompt an error and the logs

      lib.log('error', 'The actual build request is not started ('+status+'). Please review the logs');

      require('./impl/apb-log-impl.js').run(program, lib, id, function () {
        lib.exit(1);
      });
    }

  } else {
    // The continuous mode is not enabled, just skipping
    lib.exit(0);
  }
});

/**
 * Function for getting the logs of the build, it includes some health checks
 * if the logs stopped for some other reasons (ngin timeout)
 * @param  {number} id     id of the build to check
 * @param  {string} status previous status of the build
 * @return {[type]}        [description]
 */
function getLogs(id, status) {

  lib.log('debug', '(' + logCount + ') Checking the logs... (' + id + ') ' + status);

  // If we hecked so many times the logs...
  if (logCount === logLimit) {
    lib.log('error', 'The logs have been restarted to many times, Exiting... Please contact with your administrator');
    lib.exit(1);
  }
  logCount++;

  // Printing the logs
  require('./impl/apb-log-impl.js').run(program, lib, id, function (status) {

    // If the status is still running (QUEUED, RUNNING)
    if (lib.isRunningStatus(status)) {
      lib.log('debug', 'The logs ended with a running status: ' + status);
      getLogs(id, status);
    } else {

      lib.log('debug', 'The logs ended with a not running status: ' + status);

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
    }
  });
}
