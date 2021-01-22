#!/bin/bash

# files
BUILD=".build.zip"

# dirs
ENTRY=$PWD
TMPDIR=$(mktemp -d "${PWD:-/tmp}"/.deploy.XXXXXXXX)
SERVICES="${TMPDIR}/bundle/packages/@services"
FUNCTIONS="${TMPDIR}/bundle/packages/functions"

# clean up
function finish {
  rm -rf "$TMPDIR"
}

trap finish EXIT

# unzip build into tmp
unzip -o -qq $BUILD -d $TMPDIR

# update paths and rearrange dirs
find $SERVICES -name package.json | xargs sed -i '' s,workspace:packages/@services,file:..,
sed -i '' s,workspace:packages,file:., ${FUNCTIONS}/package.json
mv $SERVICES $FUNCTIONS

# deploy functions
cd $FUNCTIONS
npm i --production --quiet
firebase deploy --only functions

# on success cleanup
cd $ENTRY
rm $BUILD
