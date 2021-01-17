#!/bin/bash

WORKSPACE_PATH=$1;

if [ ! $WORKSPACE_PATH ]; then
  echo 'No workspace path provided as the first argument';
  exit 1;
fi

PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;
SERVICES_ROOT=$PROJECT_ROOT/services;
WORKSPACE_ROOT=$PROJECT_ROOT/$WORKSPACE_PATH;

SERVICES=$(find $SERVICES_ROOT -type f -not \( -name 'package.json' \));
WORKSPACE_SERVICES=$WORKSPACE_ROOT/services;
LOCAL_SERVICES=$WORKSPACE_ROOT/../services;

mkdir $WORKSPACE_SERVICES;

cp $PROJECT_ROOT/.env $WORKSPACE_ROOT;
cp $PROJECT_ROOT/credentials.firebase.json $WORKSPACE_ROOT;
cp $PROJECT_ROOT/services/package.json $WORKSPACE_SERVICES;

ln -s $SERVICES $WORKSPACE_SERVICES;

if [ -d $LOCAL_SERVICES ]; then
  ln -s $LOCAL_SERVICES/* $WORKSPACE_SERVICES;
fi
