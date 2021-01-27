#!/bin/bash

# files
BUILD=".build.zip"

# dirs
ENTRY=$PWD
# TMPDIR=$(mktemp -d /tmp/${1}-deploy.XXXXXXXX)
TMPDIR=$(mktemp -d "${PWD:-/tmp}".deploy.XXXXXXXX)
SERVICES="${TMPDIR}/bundle/packages/@services"
PACKAGE="${TMPDIR}/bundle/packages/${1}"

# clean up
function finish {
  rm -rf "$TMPDIR"
}

trap finish EXIT

# unzip build into tmp
mv $BUILD $TMPDIR
unzip -o -qq "${TMPDIR}/${BUILD}" -d $TMPDIR

# update paths and rearrange dirs
find $SERVICES -name package.json | xargs sed -i '' s,workspace:packages/@services,file:..,
sed -i '' s,workspace:packages,file:., ${PACKAGE}/package.json
mv $SERVICES $PACKAGE

# deploy
cd $PACKAGE

if [ $1 == "functions" ]
then
  npm i --production --quiet 2> /dev/null
  firebase deploy --force --only functions
else
  gcloud beta app deploy --quiet --stop-previous-version
fi
