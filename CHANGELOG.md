# Command Line Interface
  
Command Line Interface for communicating the clients with the builder services.

## [1.0.2] - 2015-04-07

### Fixed
- Fix error when there is no ignore file
- Show the status of a build when it's failed

## [1.0.1] - 2015-04-05

### Fixed
- Improved the end of the build on the continuos mode. Some builds hangs after the logs checking for the artifacts. Added a iteration status check after the logs finished waiting for a finished status

## [1.0.0] - 2015-03-31

### Added
- Validation to the endpoint config property
- Re-branding script

### Fixed
- Fixed the ignore file pattern to use gitignore style instead of glob
- Fixed the --path option in build command

### Changed
- Change the name of the npm package to the command

### Removed 
- The bump package for automatic upgrades

## [0.0.7] - 2015-03-14

### Added
- Add option to config command to list all the configured options
- Extract config path in function

### Fixed
- Fixing HTTP Redirects

### Removed 
- Remove artifactRegex from config file

## [0.0.6] - 2015-02-16
### Added
- Login command. Login through the oauth API and stores the token and the logged user in the system as options.
- Logout command. Command for login out the CLI, removes the stored token and the user on the system.
- Whoami command. Command for showing the logged user in the system.

### Changed
- Removed the mandatory token for API calls. Now this option is optional for CI executions

## [0.0.5] - 2015-02-10

### Changed
- Changed the node fs by the graceful-fs
- Changed unzip2 by adm-zip for decompressing artifacts

### Fixed
- Error decompressing large files
- Error zipping to many files

## [0.0.4] - 2015-02-02
### Added
- New flavor option for building only one flavor on a build request.
- Added the new feature of ignoreFile for the build command
- Configured the files for building the Client project into the builder project

### Changed
- Improved command and sub-commands help. More documentation, usage and colors.
- Environmental vars on build request payload are passed as array of strings (key=value).

### Fixed
- Continuous build doesn't download the artifacts at the end.
- Error catching on reading ignore file from filesystem.

## [0.0.3] - 2015-01-27
### Fixed
- Change the deployment plan for configuring the endpoint env var

## [0.0.2] - 2015-01-27
### Added
- Add dynamic options for the commands (--env key=value). This options will be send to the upload command like the email or the flavor
- Continuous build. The build command allow to pipe the logs and the download after the build call (build command option). 
- Config Command. Added config command for showing and setting the client properties (such as endpoint)
- Integration tests. Mocking server and filesystem

### Changed
- The key properties such as (endpoint or file) are stored as local properties configured by the deployment server

### Fixed
- The extraction path was not correct

## [0.0.1] - 2015-01-19
### Added
- Download artifacts after successful build by id
- Log Command. Tails the standard output of the build output by id.
- Status Command. Checks the status of the build by id
- Build command. Zipping the folder and sending to the server
