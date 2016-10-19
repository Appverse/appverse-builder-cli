'use strict';

module.exports = {

    run: function (program, lib, callback) {

        var folder = lib.configureOptionalOption(program.folder, process.cwd());

        // Validate folder and config file
        var config = lib.isValidFolder(folder);
        lib.isValidConfigFile(config);


        var flavorCount = 0;
        // Check if there is only one flavor configured for continuous mode
        if (program.continuous && !program.flavor) {

            flavorCount = 0;
            config.engine.platforms.forEach(function (platform) {
                platform.flavors.forEach(function (flavor) {
                    lib.log('debug', 'flavor:' + flavor);
                    flavorCount++;
                });
            });

            if (flavorCount > 1) {
                lib.log('error', 'There are more than one flavor configured: ' + flavorCount + ' flavors');
                lib.exit(1);
            }
        }

        if (program.flavor) {

            if (program.flavor === true) {
                lib.log('error', 'You should specify a flavor name');
                lib.exit(1);
            }

            flavorCount = 0;
            config.engine.platforms.forEach(function (platform) {
                platform.flavors.forEach(function (flavor) {
                    if (flavor.name === program.flavor) {
                        lib.log('debug', 'flavor found on the yml:' + flavor.name);
                        flavorCount++;
                    }
                });
            });

            if (flavorCount === 0) {
                lib.log('error', 'You specified a flavor that is not configured on the configuration file.');
                lib.exit(1);
            } else if (flavorCount > 1) {
                lib.log('error', 'The flavor name <' + program.flavor + '> must be unique on the configuration file. Found ' + flavorCount + ' occurrences.');
                lib.exit(1);
            } else {
                lib.log('debug', 'Calling the build command with the flavor: ' + program.flavor);
            }
        }

        lib.log('info', 'Building project... ');

        // Zip te current folder
        lib.zipFolder(folder, program.zipFile, function (file) {

                lib.api.upload.url = lib.getConfig('endpoint') + lib.api.upload.url;

                var token = program.token || lib.getUserConfig('access_token');
                lib.log('debug','token: ' + token);
                lib.api.upload.headers.Authorization = 'Bearer ' + token;

                // Add the file to the payload
                var payload = {
                    payload: file
                };

                // If there is a flavor as an option. add it to the payload
                if (program.flavor) {
                    payload.flavor = program.flavor;
                }

                // If there are options on the command, attach to the payload
                if (program.env) {
                    var optionsArray = [];
                    Object.keys(program.envVars).forEach(function(entry){
                        optionsArray.push(entry + '=' + program.envVars[entry]);
                    });
                    lib.log('debug','Adding environmental variables: ' + optionsArray);
                    payload.options = optionsArray;
                }

                // Send the zip to the API
                lib.request(
                    lib.api.upload, payload,
                    function (body) {
                        try {
                            if (lib.isLogPrintable()) {
                                console.log(lib.printTable(JSON.parse(body).requests));
                            }
                        } catch (e) {
                            // We should add a try catch in case there is a invalid response
                            lib.log('error', 'There is an error parsing the response: ' + e);
                            lib.exit(1);
                        }

                        callback(JSON.parse(body));
                    });
            }
        );
    }
};

