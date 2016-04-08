'use strict';

module.exports = {

    run: function (program, lib, callback) {

        if (lib.checkLogged()) {
            lib.log('error', 'You are not logged on the system');
            lib.exit(1);
        } else {
            lib.log('info', lib.getUserConfig('whoami'));
            callback();
        }
    }
};
