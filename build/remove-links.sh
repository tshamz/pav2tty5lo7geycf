#!/bin/bash
# 2> /dev/null

WORKSPACE_PATH=$1;

if [ ! $WORKSPACE_PATH ]; then
  echo 'ERROR: No workspace path provided as the first argument';
  exit 1;
fi

PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;
WORKSPACE_ROOT=$PROJECT_ROOT/$WORKSPACE_PATH;
WORKSPACE_SERVICES=$WORKSPACE_ROOT/services;

rm -rf $WORKSPACE_SERVICES;
rm -f $WORKSPACE_ROOT/.env;
rm -f $WORKSPACE_ROOT/credentials.firebase.json;
