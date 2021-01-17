#!/bin/bash

WORKSPACE_PATH=$1;

if [ ! $WORKSPACE_PATH ]; then
  echo 'ERROR: No workspace path provided as the first argument';
  exit 1;
fi

PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;
WORKSPACE_ROOT=$PROJECT_ROOT/$WORKSPACE_PATH;
WORKSPACE_SERVICES=$WORKSPACE_ROOT/services;
SYMLINKS=$(find $WORKSPACE_ROOT -type l -not \( -path '*node_modules*' \)) 2> /dev/null;

for FILE in $SYMLINKS; do
  if [ ! -d $FILE ]; then
    ORIGINAL=$(realpath "$FILE") 2> /dev/null;
    rm $FILE 2> /dev/null;
    cp $ORIGINAL "$FILE" 2> /dev/null;
  fi
done
