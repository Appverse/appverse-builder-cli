'use strict';

require('colors');
var req = require('request');
var syncrequest = require('sync-request');
var yaml = require('yamljs');
var archiver = require('archiver');
var Table = require('cli-table');
var path = require('path');
var os = require('os');
var ProgressBar = require('progress');
var LocalStorage = require('node-localstorage').LocalStorage;
var glob = require('glob');
var winston = require('winston');
var parser = require('gitignore-parser');
var fs = require('fs');
winston.cli();

/**
 * Bar for showing the progress status of the downloads
 * @type {ProgressBar} Progress bar object
 */
var bar = new ProgressBar('[:bar] :percent :elapseds :etas ', {
    complete: '=',
    incomplete: ' ',
    total: 100,
    width: 50
});

/**
 * Variable for storing the localstorage for the execution of the client
 */
var localStorage;

/**
 * Variable for storing the user localstorage for the execution of the client
 */
var userLocalStorage;

var filesystem;

module.exports = {

    /**
     * Set the value of the filesystem we are using in the library
     * @param _fs Filesystem
     */
    setFileSystem: function (_fs) {
        filesystem = _fs;
    },

    /**
     * Returns the filesystem used in the library
     * @returns {*} Filesystem
     */
    getFileSystem: function () {
        return filesystem;
    },

    /**
     * Method for printing the output of the program on stdout
     * @param _level Level of log {debug, info, warn, error}
     * @param msg Message to print
     */
    log: function (_level, msg) {
        winston.log(_level, msg + '');
    },

    /**
     * Method for exiting the program with a concrete exit code
     * @param _code Exit code
     */
    exit: function (_code) {
        this.log('debug', 'exiting program with code <' + _code + '>');
        process.exit(_code);
    },

    /**
     * Enables the debug level for the logger
     */
    debugLevel: function (debug) {
        if (debug) {
            winston.level = 'debug';
            req.debug = true;
            this.log('debug', 'debug level enabled');
        }
    },

    /**
     * Changes the log level for the logger
     */
    setLogLevel: function (level) {
        winston.level = level;
    },

    /**
     * Returns the logger log level
     * @returns {*}
     */
    getLogLevel: function () {
        return winston.level;
    },

    /**
     * Return if the log should be printed in normal behaviour
     */
    isLogPrintable: function () {
        return !!(this.getLogLevel() === 'info' || this.getLogLevel() === 'debug' || this.getLogLevel() === 'trace');
    },

    /**
     * Getter for the status bar
     * @returns {ProgressBar} Progress bar object
     */
    getBar: function () {
        return bar;
    },

    /**
     * Returns the full execution path of the bin command
     * @returns {string} bin command path
     */
    getBinPath: function () {
        return 'node ' + path.join(__dirname, '../src/apb.js') + ' ';
    },


    /**
     * Name of the zip file to send for building
     * @returns {string} Path of the file
     */
    getZipPayloadPath: function () {
        var p = path.join(os.tmpDir(), 'build.zip');
        this.log('debug', 'payload path: ' + p);
        return p;
    },

    /**
     * Name of the zip file to receive the artifacts
     * @returns {string} Path of the file
     */
    getZipArtifactPath: function () {
        var p = path.join(os.tmpDir(), 'artifacts.zip');
        this.log('debug', 'artifacts path: ' + p);
        return p;
    },

    /**
     * Returns the full execution path of the bin command
     * @returns {string} bin command path
     */
    getConfigPath: function () {
        return path.join(__dirname, '.config');
    },

    /**
     * Method for checking optional options of the command. The emthod return the value
     * if this is set, the default value instead.
     * @param _value Optional value
     * @param _defaultValue Default value
     * @returns {*} Final value of the option
     */
    configureOptionalOption: function (_value, _defaultValue) {

        var ret;

        this.log('debug', 'Configuring optional option. value=' + _value + ', default value=' + _defaultValue);
        if (_value !== undefined) {
            ret = _value;
        } else {
            ret = _defaultValue;
        }

        this.log('debug', 'Configuring optional option. Returning=' + ret);
        return ret;
    },

    /**
     * Method for validating the number of arguments of the program
     * @param program Running program
     * @param n Number of expected arguments
     */
    validateArgs: function (program, n) {

        if (program.args.length !== n) {
            this.log('error', 'The number of arguments is not correct.');
            this.exit(1);
        } else {
            this.log('debug', 'number of arguments correct: expected=' + n + ', args=' + program.args.length);
        }
    },

    /**
     * Method for validating the number of arguments of the program
     * @param program Running program
     * @param n Array of expected arguments
     */
    validateArgsVariable: function (program, n) {

        var self = this, founded = false;

        n.forEach(function (number) {
            if (program.args.length === number) {
                self.log('debug', 'number of arguments correct: expected=' + n + ', args=' + program.args.length);
                founded = true;
            }
        });

        if (!founded) {
            this.log('error', 'The number of arguments is not correct.');
            this.exit(1);
        }

    },

    /**
     * Method for validating a concrete option on the subcommand
     * @param option Option value
     * @param optionName Option name
     */
    validateOption: function (option, optionName) {
        if (!option) {
            this.log('error', 'You should specify a <' + optionName + '> option.');
            this.exit(1);
        } else {
            this.log('debug', 'option <' + optionName + '> validated correct with value=' + option);
        }
    },

    /**
     * Generic function for accessing the common API for the builder
     * @param _options JSON array with the request options (url, headers, etc...)
     * @param _data Data for the request (formData, DTO, empty, etc...)
     * @param callback Function for the callback response
     */
    request: function (_options, _data, callback) {

        var self = this;
        self.log('debug', 'Executing request: ' + _options.url);

        // Content of the request
        if (_options.form) {
            _options.form = _data;
        } else if (_options.formData) {
            _options.formData = _data;
        } else {
            _options.body = _data;
        }

        req(_options)

            // When we receive the first chunk of the response
            .on('response', function (response) {

                self.log('debug', 'Response code: ' + response.statusCode);
                self.handleStatusCode(response, _options, _data, callback);

                response.on('data', function (data) {
                    self.log('debug', 'received ' + data.length + ' bytes of compressed data');
                });
            })

            // Error generation the response
            .on('error', function (error) {
                if (error.code === 'ECONNREFUSED') {
                    self.log('error', 'The site <' + self.getConfig('endpoint') + '> is not available. Please try again later');
                } else {
                    self.log('error', error);
                }
                self.exit(1);
            })

            // Every time we receive data
            .on('data', function (data) {
                self.log('debug', 'received ' + data.length + ' bytes of decompressed data');
                callback(data);
            });
    },

    /**
     * Generic function for accessing the common API for the builder synchronously
     * @param _options JSON array with the request options (url, headers, etc...)
     * @param _data Data for the request (formData, DTO, empty, etc...)
     */
    syncrequest: function (_options, _data) {

        var self = this;
        self.log('debug', 'Executing request: ' + _options.url);

        // Content of the request
        if (_options.form) {
            _options.form = _data;
        } else if (_options.formData) {
            _options.formData = _data;
        } else {
            _options.body = _data;
        }

        var data = syncrequest(_options.method, _options.url, _options);
        return data;
    },

    /**
     * Function for handling all the status codes of the responses to the API
     * @param _response Response of the API server
     * @param _options Request options
     * @returns {boolean} Returns true if the status code is correct
     */
    handleStatusCode: function (_response, _options, _data, _callback) {

        switch (_response.statusCode) {
            case 204: // no content
                this.log('error', 'No Content (204). There is no content for that build request.');
                this.exit(1);
                break;
            case 302: //redirect
                _options.url = _response.headers.location;
                this.request(_options, _data, _callback);
                break;
            case 400: // bad request
                this.log('error', 'Bad Request (400). Check the parameters.');
                this.exit(1);
                break;
            case 401: // unauthorised
                this.log('error', 'Unauthorised request (401). Check credentials.');
                this.exit(1);
                break;
            case 403: // forbidden
                this.log('error', 'Forbidden request (403). Check the configuration.');
                this.exit(1);
                break;
            case 404: // not found
                this.log('error', 'Element [' + _options.url + '] not found (404).');
                this.exit(1);
                break;
            case 406: // not acceptable
                this.log('error', 'Not acceptable. The information send is not valid.');
                this.exit(1);
                break;
            case 500: // internal server error
                this.log('error', 'There is a problem with the request. Please validate your input files.');
                this.exit(1);
                break;
            case 502: // bad gateway
                this.log('error', 'There is a problem with the API. Please contact your administrator.');
                this.exit(1);
                break;
            default: // valid cases
                this.log('debug', 'The status code <' + _response.statusCode + '> is validated correctly for the url=' + _options.url + '.');
                return true;
        }
    },

    /**
     * Function that checks if the current folder is a valid folder for building a valid project
     * @returns Configuration file in JSON format
     */
    isValidFolder: function (folder) {

        this.log('debug', 'Validating current folder: ' + folder);

        // Check if the current folder contains a valid project
        try {
            var config = yaml.load(path.join(folder, this.getConfig('configFile')));
            this.log('debug', 'Current folder: ' + folder + ' is valid :)');
            return config;
        } catch (e) {
            this.log('error', e.message);
            if (e.code === 'ENOENT') {
                this.log('error', 'The current folder is not an valid project folder. There is no ' + this.getConfig('configFile') + ' file.');
            }
            this.exit(1);
        }
    },

    /**
     * Function that checks the contents of the config file
     * @param _config Configuration file
     */
    isValidConfigFile: function (_config) {

        this.log('debug', 'Validating config file: ' + this.getConfig('configFile'));

        try {
            // Validate config file contents
            if (!_config.engine) {
                this.log('error', 'The engine is not configured in the ' + this.getConfig('configFile') + '.');
                this.exit(1);
            } else {
                this.log('debug', 'config.engine: ' + JSON.stringify(_config.engine));
            }
            if (_config.engine.platforms.length < 0) {
                this.log('error', 'There are no platforms configured in the ' + this.getConfig('configFile') + ' for the engine ' + _config.engine.name + '.');
                this.exit(1);
            } else {
                this.log('debug', 'config.engine.platforms: ' + JSON.stringify(_config.engine.platforms));
            }

            // TODO: Add more validations following the wiki

        } catch (e) {
            this.log('error', e.message);
            this.log('error', 'There is a problem parsing the ' + this.getConfig('configFile') + ' file.');
            this.exit(1);
        }

        this.log('debug', 'Config file: ' + this.getConfig('configFile') + ' is valid :)');
    },

    /**
     * Function for zipping a file and send the output read stream of the zip to the callback
     * @param _path Path of the zipping folder contents
     * @param _zipFile Zip file for skipping the zip folder
     * @param callback result function to execute with the output read stream of the zip
     */
    zipFolder: function (_path, _zipFile, callback) {

        var self = this;

        // If the zip file is generated, we can skip the zip folder
        if (_zipFile) {
            this.log('debug', 'Using zipFile ' + _zipFile);
            callback(this.getFileSystem().createReadStream(_zipFile));
            return;
        }

        this.log('debug', 'zipping folder: ' + _path);

        // Validate path
        try {
            if (!self.getFileSystem().lstatSync(_path).isDirectory()) {
                this.log('error', 'The current folder provided is not a folder.');
                this.exit(1);
            }
        } catch (e) {
            this.log('error', e.message);
            this.exit(1);
        }

        var archive = archiver('zip');
        var output = self.getFileSystem().createWriteStream(self.getZipPayloadPath());

        output.on('close', function () {
            self.log('debug', 'Zip generated: ' + self.getZipPayloadPath() + ' (' + archive.pointer() + ' bytes).');
            callback(self.getFileSystem().createReadStream(self.getZipPayloadPath()));
        });
        output.on('error', function (e) {
            self.log('error', e.message);
            self.exit(1);
        });

        // Pipe the archive file into the output zip
        archive.pipe(output);

        // Converting .gitignore to blob patterns
        var ignore = parser.compile('.');
        var ignoreFile = self.getConfig('ignoreFile');
        try {
            ignore = parser.compile(fs.readFileSync(path.join(_path, ignoreFile), 'utf8'));
        } catch (e) {
            if (e.code === 'ENOENT') {
                self.log('warn', 'There is not ignoring file [' + ignoreFile + '] Please, consider adding one to avoid sending useless file to build.');
            } else {
                self.log('error', e.message);
                self.exit(1);
            }
        }

        // TODO: folder path is not used

        var numberOfFiles = 0;
        glob('**/**', {dot: true, cwd: _path}, function (er, files) {

            files.filter(ignore.accepts).forEach(function (entry) {

                var filestats = self.getFileSystem().lstatSync(path.join(_path, entry));

                if (filestats.isFile()) {
                    self.log('debug', 'Zipping file: ' + entry);
                    numberOfFiles++;
                    archive.append(self.getFileSystem().createReadStream(path.join(_path, entry)), {
                        name: entry,
                        mode: filestats.mode
                    });
                }
            });
            self.log('info', 'Zipped ' + numberOfFiles + ' files.');
            archive.finalize();
        });
    },

    /**
     * Function for checking if the user is logged in the system
     */
    checkLogged: function () {

        if (!this.getUserConfig('access_token')) {
            this.log('error', 'You are not logged in the system');
            this.exit(1);
        }
    },

    /**
     * Funtion for checking if the user is not logged in the system
     */
    checkNotLogged: function () {

        if (this.getUserConfig('access_token')) {
            this.log('error', 'You are logged in the system. Please logout');
            this.exit(1);
        }
    },

    /**
     * Function that prints the result of the api call in a table
     * @param _data Data to fill the table
     */
    printTable: function (_data) {

        var _table = new Table({
            head: ['id'.blue, 'engine'.blue, 'platform'.blue, 'flavor'.blue, 'start time'.blue, 'end time'.blue, 'status'.blue, 'message'.blue]
        });

        // Parse the buildRequests
        _data.forEach(function (item) {
            var status;
            switch (item.status) {
                case 'QUEUED':
                    status = (item.status).yellow;
                    break;
                case 'RUNNING':
                    status = (item.status).blue;
                    break;
                case 'SUCCESSFUL':
                    status = (item.status).green;
                    break;
                case 'CANCELLED':
                    status = (item.status).red;
                    break;
                case 'FAILED':
                    status = (item.status).red;
                    break;
                default :
                    status = (item.status).red;
            }
            var startTime = item.startTime === null ? '-' : item.startTime;
            var endTime = item.endTime === null ? '-' : item.endTime;

            var message = item.message === null ? '' : item.message;

            _table.push([item.id, item.engine, item.platform, item.flavor, startTime, endTime, status, message]);
        });

        return _table.toString();
    },

    /**
     * Method for initializing the local storage of the client
     */
    initLocalStorage: function () {

        if (typeof localStorage === 'undefined' || localStorage === null) {
            var confDir = this.getConfigPath();
            try {
                localStorage = new LocalStorage(confDir);
            } catch (e) {

                // If there is a problem accessing the local storage
                this.log('error', 'There is a problem initializating the local storage: ' + e);
            }
        }
    },

    /**
     * Method for initializing the local storage of the client
     */
    initUserLocalStorage: function () {

        var isInTest = typeof global.it === 'function';

        var brand = '.apb';

        if (typeof userLocalStorage === 'undefined' || userLocalStorage === null) {

            var localDir;
            if (isInTest) {
                localDir = path.join(path.resolve(__dirname), '.userConfig');
            } else {
                var homeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
                localDir = path.join(homeDir, brand, '.cli');
            }

            try {
                userLocalStorage = new LocalStorage(localDir);
            } catch (e) {

                // If there is a problem accessing the local storage
                try {
                    this.getFileSystem().mkdirSync(path.join(homeDir, brand));
                    this.getFileSystem().mkdirSync(localDir);
                    userLocalStorage = new LocalStorage(localDir);
                } catch (e) {
                    if (e.code !== 'EEXIST') {
                        this.log('error', e);
                        this.log('error', 'There is a problem creating the ' + brand + ' folder. Please create a folder <' + brand + '> in your home directory');
                        this.exit(1);
                    }
                }
            }
        }
    },

    /**
     * Retrieve a config option on the local storage
     * @param _key Key to retrieve
     */
    getConfig: function (_key) {
        this.initLocalStorage();
        var value = localStorage.getItem(_key);
        if (value) {

            if (_key === 'endpoint') {
                if (value.slice(-1) !== '/') {
                    this.log('debug', 'Adding trailing / to the url');
                    value = value + '/';
                }
                if (!(new RegExp('^(http|https)://', 'i').test(value))) {
                    this.log('debug', 'The url does not start with http');
                    value = 'https://' + value;
                }
            }
            return value;
        } else {
            this.log('error', 'The config property <' + _key + '> is not configured in the system');
            this.exit(1);
        }
    },

    /**
     * Set a config option in the local storage
     * @param _key Key to store
     * @param _value Value to store
     */
    setConfig: function (_key, _value) {
        this.initLocalStorage();
        return localStorage.setItem(_key, _value);
    },

    /**
     * Delete a config from the local storage
     * @param _key Key to retrieve
     */
    removeConfig: function (_key) {
        this.initLocalStorage();
        return localStorage.removeItem(_key);
    },

    /**
     * Set a user config option in the local storage
     * @param _key Key to store
     * @param _value Value to store
     */
    setUserConfig: function (_key, _value) {
        this.initUserLocalStorage();
        userLocalStorage.setItem(_key, _value);
    },

    /**
     * Retrieve a user config option on the local storage
     * @param _key Key to retrieve
     */
    getUserConfig: function (_key) {
        this.initUserLocalStorage();
        var value = userLocalStorage.getItem(_key);
        if (value) {
            return value;
        } else {
            this.log('debug', 'The config property <' + _key + '> is not configured in the system');
        }
    },

    /**
     * Delete a config from the local storage
     * @param _key Key to retrieve
     */
    removeUserConfig: function (_key) {
        this.initUserLocalStorage();
        return userLocalStorage.removeItem(_key);
    },

    /**
     * Function for checking the status of a build depending on the
     * API return string
     * @param _status Status of the build to check
     * @returns {boolean} true is status is correct, false otherwise
     */
    isValidStatus: function (_status) {

        switch (_status) {
            case 'RUNNING':
            case 'QUEUED':
            case 'SUCCESSFUL':
                return true;
            case 'CANCELLED':
            case 'FAILED':
                return false;
            default:
                this.log('error', 'The status <' + _status + '> is not on the system');
                return false;
        }
    },

    /**
     * Function for checking the status of a build depending on the
     * API return string
     * @param _status Status of the build to check
     * @returns {boolean} true is status is correct, false otherwise
     */
    isWaitingStatus: function (_status) {

        switch (_status) {
            case 'QUEUED':
                return true;
            case 'RUNNING':
            case 'SUCCESSFUL':
            case 'CANCELLED':
            case 'FAILED':
                return false;
            default:
                this.log('error', 'The status <' + _status + '> is not on the system');
                return false;
        }
    },

    isRunningStatus: function (_status) {

        switch (_status) {
            case 'QUEUED':
            case 'RUNNING':
                return true;
            case 'SUCCESSFUL':
            case 'CANCELLED':
            case 'FAILED':
                return false;
            default:
                this.log('error', 'The status <' + _status + '> is not on the system');
                return false;
        }
    },

    /**
     * Function waiting some milliseconds in javascript
     * @param _millis Milliseconds to wait
     */
    sleep: function (_millis) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > _millis){
          break;
        }
      }
    },

    /**
     * API calls configuration. Url's, methods and header for configuring
     * the requests to the Builder Host
     */
    api: {
        login: {
            url: 'oauth/token',
            method: 'POST',
            form: true, // x-www-form-urlencoded
            encoding: 'utf-8',
            headers: {
                Accept: '*/*',
                Authorization: ''
            }
        },
        logout: {
            url: 'api/logout',
            method: 'POST',
            encoding: 'utf-8',
            headers: {
                Accept: '*/*'
            }
        },
        upload: {
            url: 'api/buildChains/payload',
            method: 'POST',
            encoding: 'utf-8',
            formData: true, // multipart/form-data
            headers: {
                Accept: '*/*',
                Authorization: ''
            }
        },
        status: {
            url: 'api/buildRequests/{id}',
            method: 'GET',
            encoding: 'utf-8',
            formData: false,
            headers: {
                Accept: '*/*',
                Authorization: ''
            }
        },
        log: {
            url: 'api/buildRequests/{id}/log',
            method: 'GET',
            //encoding: 'utf-8',
            formData: false,
            headers: {
                Accept: 'text/plain',
                Authorization: ''
            }
        },
        download: {
            url: 'api/buildRequests/{id}/artifacts/compressed',
            method: 'GET',
            //encoding: 'utf-8',
            formData: false,
            headers: {
                Accept: '*/*',
                Authorization: ''
            }
        }

    }
};
