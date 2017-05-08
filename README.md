# appverse-builder-cli

In order to communicate the developers to the Builder Infrastructure there is a Command Line Interface called apb. This Command Line Tool allows you interact with the system and build your projects, see the logs and retrieve your artifacts with a few commands.

The Command is done with [NodeJS](https://nodejs.org/en/) so, the tool is multiplatform (win-osx-lin) but you need a [NodeJS](https://nodejs.org/en/) environment in your machine.

The distribution platform for this software is [NPM](https://www.npmjs.com/).

### Pre-requisites

You should have [NodeJS](https://nodejs.org/en/) installed on your machine before proceeding with the installation. If you don't have it, please download it from [here](https://nodejs.org/en/download/) for your platform.

### Installation

The Command Line Interface is a system command, so the installation should be global (-g option) and the custom registry should be specified.

```
npm install -g appverse-builder-cli --registry=https://nexus3.gftlabs.com/repository/npm-public
```

If you want to see all the available commands of the client you could run:

```
$ apb -h

  Usage: apb <command> [<args>] [options]


  Commands:

    login                 Login into the platform
    whoami                answers if you are logged or not and who are you
    build                 send the current project to The Builder
    status <id>           check the status of the build <id>
    log <id>              retrieve the logs of the build <id>
    download <id>         download the artifacts for the build <id>
    config <key> <value>  configure options on the client. Pass the key-value as arguments. Pass only the key for showing the value
    logout                Logout from the platform
    help [cmd]            display help for [cmd]

  Command Line Interface for communication the clients with the main builder.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Usage

The apb client is a command line tool with subcommands as the git client style. You could check the subcommands for building, logs and download:

```
  apb --help
  apb <subcommand> --help
```

### Login into the client

In order to use the client it is necessary to be logged on the system. In order to log in you should execute:

```
  apb login
  ? Enter your username: ********
  ? Enter your password: ********
```

Once you’re logged in the system you could execute all the commands for building a project.

If you want to logout of the client you could run:

```
  apb logout
```

### Building an application

From inside a valid project folder (contains a .apb.yml file) you can build all your flavours configured in the configuration file (.apb.yml).

This command will zip the contents of the current folder (you can change it with the --folder option) and send it to the main API in order to build the project. The --token option now it's mandatory in order to proceed with the authentication and authorization system.

In case you only want to build only one flavour of your .apb.yml you should specify the --flavor option. In that case, the flavour name must be unique.

If you want to pass environmental variables for on specific build you can use the --env option. This option will enable all the options you pass on the build command during the build time.

Another option for available for the build command is the continuous mode This mode will tail all the operations related to one build. First is going to start a build, then tail the logs on the console, and finally is going to download all the artifacts for that request. You should notice if you're using this option, you only can build one flavour, so you have to configure 1 flavour on your .apb.yml or specify a flavour with the --flavor option.

```
  Usage: apb build [options]

  Build the current (pwd) project into The builder. Command for zipping the actual folder and send it to the main builder.

  Options:

    -h, --help            output usage information
    -d, --debug           enable debug mode
    -c --continuous       enable continuous build (build > logs > download)
    --folder [folder]     change the build folder. Default: pwd
    --token [token]       authorization token
    -f --flavor [flavor]  Select only one flavor to build. Flavor name must be unique.
    -e, --env key=value   custom environmental variables
```

This command will prompt a table with all build request generated for this build. You can use the <id> of the response to query the next subcommands in the CLI.

You can add a -d (–debug) option to every command in the CLI to promt more logs and make the command more verbose

If you want to ignore certain files on build, you could use the ignore file configuration (apb config ignoreFile). This file uses gitignore pattern and skip all the files on the upload for build.

### Checking the logs of an application

To check the logs on real time of the build request you can run the following command with the <id> returned by the build subcommand.

```
  Usage: apb log <id> [options]

  Tail the log of the build <id> to your screen

  Options:

    -h, --help       output usage information
    -d, --debug      enable debug mode
    --token [token]  authorization token
```

This command pipes the standard output of the build into your terminal to check the logs in real time.

### Check the status of a build request

To check the current status of a build request you could run the following subcommand with the <id> returned by the build subcommand

```
  Usage: apb status <id> [options]

  Check the status of the build <id>

  Options:

    -h, --help       output usage information
    -d, --debug      enable debug mode
    --token [token]  authorization token
```

### Downloading the artifacts

To download all the artifacts of a build request you can run the following subcommand with the <id> returned by the build subcommand. By default the subcommand will download the build artifacts in {current_folder}/build/ <id> but you can change this option with --folder option.

```
  Usage: apb download <id> [options]

  Download the artifacts for the build [id]. The artifacts can be located in the ./build/<id> folder

  Options:

    -h, --help         output usage information
    -d, --debug        enable debug mode
    --token [token]    authorization token
    --folder [folder]  change the build output folder. Default: build
```

### Configuring the client

To configure the client you can use the config subcommand. This command will prompt the config value in case you want to see the value, or it can change the value if you pass the key and the value as arguments on the config command.

```
  Usage: apb config <key> [value] [options]

  Configure options on the client. Pass the key-value as arguments. Pass only the key for showing the value

  Options:

    -h, --help   output usage information
    -l, --list   list all configured options
    -d, --debug  enable debug mode
```

Happy Building! (ᵔᴥᵔ)
