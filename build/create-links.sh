#!/bin/bash

function createLinks() {
  PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;
  SERVICES_ROOT=$PROJECT_ROOT/services;
  SERVER_SERVICES=$PROJECT_ROOT/servers/services;
  CREDENTIALS_PATH=$PROJECT_ROOT/credentials.firebase.json;

  mkdir $PROJECT_ROOT/servers/{markets,notifications,status}/services;

  for FILE in $SERVICES_ROOT/*; do
    if [ -f "$FILE" ]; then
      ln -s $FILE $PROJECT_ROOT/servers/markets/services;
      ln -s $FILE $PROJECT_ROOT/servers/notifications/services;
      ln -s $FILE $PROJECT_ROOT/servers/status/services;
      ln -s $FILE $PROJECT_ROOT/firebase/functions/services;
    fi
  done

  for FILE in $SERVER_SERVICES/*; do
    if [ -f "$FILE" ]; then
      ln -s $FILE $PROJECT_ROOT/servers/markets/services;
      ln -s $FILE $PROJECT_ROOT/servers/notifications/services;
      ln -s $FILE $PROJECT_ROOT/servers/status/services;
    fi
  done

  for dir in markets notifications status; do
    if [ -f "$CREDENTIALS_PATH" ]; then
      ln -s $CREDENTIALS_PATH $PROJECT_ROOT/servers/${dir};
    fi
  done
}

createLinks
