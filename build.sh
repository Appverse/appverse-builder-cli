#!/usr/bin/env bash

# Common functions
function check_status {
  if [ "$*" != "0" ]; then
    echo "Program exited with: $*" >&2
    exit $*
  fi
}

function banner {
  figlet -f slant $*
}

banner 'npm install'

npm install
check_status $?

grunt jshint
check_status $?

node node_modules/mocha/bin/mocha -R mocha-bamboo-reporter
RESULT=$?
cat mocha.json
echo ""

banner 'Successful!'

exit $RESULT
