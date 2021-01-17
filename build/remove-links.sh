#!/bin/bash

function removeLinks() {
  PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;

  rm -rf $PROJECT_ROOT/servers/{markets,notifications,status}/services;
  rm $(find $PROJECT_ROOT -name 'credentials.firebase.json' -mindepth 2);
  rm $PROJECT_ROOT/firebase/functions/services/{firebase.js,logger.js,package.json};

  SYMLINKS=$(find $PROJECT_ROOT -type l -maxdepth 5 -not \( -path '*node_modules*' \));

  for FILE in $SYMLINKS; do
    rm $FILE;
  done
}

removeLinks;
