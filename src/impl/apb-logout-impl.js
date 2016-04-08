'use strict';

module.exports = {

    run: function (program, lib, callback) {

        // Check if the user is logged in
        lib.checkLogged();

        lib.api.logout.url = lib.getConfig('endpoint') + lib.api.logout.url;
        lib.handleStatusCode(lib.syncrequest(lib.api.logout,''), lib.api.logout);

        lib.log('info', 'Bye!');
        callback();
    }
};

