#!/bin/bash

function replaceLinks () {
  PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;
  SYMLINKS=$(find $PROJECT_ROOT -type l -maxdepth 5 -not \( -path '*node_modules*' \));

  for FILE in $SYMLINKS; do
    if [ ! -d $FILE ]; then
      ORIGINAL=$(realpath "$FILE")
      rm $FILE;
      cp $ORIGINAL "$FILE";
    fi
  done
}

replaceLinks;
