'use strict';

var inquirer = require('inquirer');

module.exports = {

    run: function (program, lib, callback) {

        var self = this;

        lib.checkNotLogged();

        // Configure the headers and url
        var clientId = lib.getConfig('client-id');
        var clientSecret = lib.getConfig('client-secret');
        lib.log('debug', 'client-id: ' + clientId);
        lib.log('debug', 'client-secret: ' + clientSecret);

        lib.api.login.url = lib.getConfig('endpoint') + lib.api.login.url;
        lib.api.login.headers.Authorization = 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64');
        lib.log('debug', 'Authorization header: ' + lib.api.login.headers.Authorization);

        // Credentials management
        var username = '';
        var password = '';

        if (program.username && program.password) {

            // Username and password as parameters

            username = program.username;
            password = program.password;
            lib.log('debug', 'Username as parameter: ' + username);
            lib.log('debug', 'Password as parameter: ' + password);

            self.executeRequest(program, lib, username, password, callback);

        } else if (program.username && !program.password) {

            // Username as parameter

            username = program.username;
            lib.log('debug', 'Username as parameter: ' + username);

            inquirer.prompt({
                type: 'password',
                message: 'Enter your password:',
                name: 'password'
            }, function (answers) {
                password = answers.password;
                self.executeRequest(program, lib, username, password, callback);
            });

        } else if (!program.username && program.password) {

            // Password as parameter

            password = program.password;
            lib.log('debug', 'Password as parameter: ' + password);

            inquirer.prompt({
                type: 'input',
                message: 'Enter your username:',
                name: 'username'
            }, function (answers) {
                username = answers.username;
                self.executeRequest(program, lib, username, password, callback);
            });

        } else {

            // No username or password by parameter

            inquirer.prompt([{
                type: 'input',
                message: 'Enter your username:',
                name: 'username'
            },{
                type: 'password',
                message: 'Enter your password:',
                name: 'password'
            }], function (answers) {
                username = answers.username;
                password = answers.password;
                self.executeRequest(program, lib, username, password, callback);
            });
        }
    },

    executeRequest: function (program, lib, username, password, callback) {

        // Request the login to the API
        lib.request(
            lib.api.login, {
                username: username,
                password: password,
                grant_type: 'password'
            },
            function (body) {
                lib.log('debug', JSON.stringify(body));
                try {
                    var token = JSON.parse(body).access_token;
                    lib.log('debug', 'Response token: ' + token);
                    callback(token, username);
                } catch (error) {
                    lib.log('error', 'There is an error obtaining the token: ' + error);
                    lib.exit(1);
                }
            });
    }
};

