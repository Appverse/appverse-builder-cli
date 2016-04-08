'use strict';

module.exports = {

    configureUrl: function(program, lib, id){

        // Url manipulations
        if (lib.api.status.url.slice(0, 4) !== 'http') {
            lib.api.status.url = lib.getConfig('endpoint') + lib.api.status.url;
        }
        lib.api.status.url = lib.api.status.url.replace('{id}', id);

        var token = program.token || lib.getUserConfig('access_token');
        lib.log('debug','token: ' + token);
        lib.api.status.headers.Authorization = 'Bearer ' + token;
    },

    run: function (program, lib, id, callback) {

        this.configureUrl(program, lib, id);

        // Send the zip to the API
        lib.request(lib.api.status, '', function (body) {
            try {
                if (lib.isLogPrintable()) {
                    console.log(lib.printTable([JSON.parse(body)]));
                }
            } catch (e) {
                // We should add a try catch in case there is a invalid response
                lib.log('error', 'There is an error parsing the response: ' + e);
                lib.exit(1);
            }
            callback(JSON.parse(body).status);
        });
    },

    runsync: function (program, lib, id) {

        this.configureUrl(program, lib, id);

        var response = '';
        try {
            response = lib.syncrequest(lib.api.status,'').body;
        } catch (e) {
            // We should add a try catch in case there is a invalid response
            lib.log('error', 'There is an error parsing the response: ' + e);
            lib.exit(1);
        }
        return JSON.parse(response).status;
    }

};


