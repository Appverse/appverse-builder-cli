'use strict';

// MARK: for the download request we are using a custom request because the output should be piped
var req = require('request');
var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');

module.exports = {

    run: function (program, lib, id, callback) {

        req.debug = program.debug;

        var percent = -1, current = 0, len = 0;

        var folder = lib.configureOptionalOption(program.folder, path.join(process.cwd(), 'build'));

        // Url manipulations
        lib.api.download.url = lib.getConfig('endpoint') + lib.api.download.url.replace('{id}', id);

        var token = program.token || lib.getUserConfig('access_token');
        lib.log('debug', 'token: ' + token);
        lib.api.download.headers.Authorization = 'Bearer ' + token;

        lib.log('info', 'Downloading artifacts for request <' + id + '>');

        // Make the request and pipe the response to a zip
        req(lib.api.download)

            // When we receive the first chunk of the response
            .on('response', function (response) {
                lib.handleStatusCode(response, lib.api.download);
                len = parseInt(response.headers['content-length'], 10);
                lib.log('debug', 'content-length:' + len);
            })

            // Error generation the response
            .on('error', function (error) {
                lib.log('error', 'Error generating the response: ' + error);
                lib.exit(1);
            })

            // Every time we receive data
            .on('data', function (chunk) {
                lib.log('debug', 'received ' + chunk.length + ' bytes of decompressed data');
                current += (chunk.length / len) * 100;
                if (Math.round(current) > percent) {
                    percent = Math.round(current);
                    if (lib.isLogPrintable()) {
                        lib.getBar().tick();
                    }
                }
            })

            // On the request end
            .on('end', function () {
                if (lib.isLogPrintable()) {
                    //lib.getBar().tick(100);
                }
            })

            // Pipe the response to the zip file
            .pipe(fs.createWriteStream(lib.getZipArtifactPath())

                // When the zip is generated, extract it
                .on('close', function () {

                    if (program.zip) {

                        lib.log('debug', 'Extracting the zip: ' + lib.getZipArtifactPath());

                        var extractPath = path.join(folder, id + '');
                        lib.log('debug', 'Extract path: ' + extractPath);

                        try {
                            var zip = new AdmZip(lib.getZipArtifactPath());
                            process.stdout.write('\n');
                            zip.getEntries().forEach(function (zipEntry) {
                                lib.log('info', extractPath + path.sep + zipEntry.entryName);
                            });
                            zip.extractAllTo(extractPath, true);

                        } catch (error) {
                            lib.log('error', 'Error extracting the zip: ' + error);
                            lib.exit(1);
                        }

                        callback();

                    } else {
                        callback();
                    }

                }));
    }
};
