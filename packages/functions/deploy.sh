#!/bin/bash

# files
build=".build.zip"
packagejson="package.json"

# dirs
entry=$PWD
tmpdir=$(mktemp -d "${PWD:-/tmp}"/.deploy.XXXXXXXX)
services="${tmpdir}/bundle/packages/@services"
functions="${tmpdir}/bundle/packages/functions"

# clean up
function finish {
  rm -rf "$tmpdir"
}

trap finish EXIT

# unzip build into tmp
unzip -o -qq $build -d $tmpdir

# update paths and rearrange dirs
find $services -name $packagejson | xargs sed -i '' s,workspace:packages/@services,file:..,
sed -i '' s,workspace:packages,file:., ${functions}/${packagejson}
mv $services $functions

# deploy functions
cd $functions
npm i --production --quiet
firebase deploy --only functions

# on success cleanup
cd $entry
rm $build
