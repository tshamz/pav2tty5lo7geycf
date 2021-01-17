#!/bin/bash

function replaceLinks () {
  PROJECT_ROOT=/Users/tylershambora/Code/Personal/pav2tty5lo7geycf;
  SYMLINKS=$(find $PROJECT_ROOT -type l -maxdepth 5 -not \( -path '*node_modules*' \));

  for FILE in $SYMLINKS; do
    if [ ! -d $FILE ]; then
      ORIGINAL=$(realpath "$FILE") 2> /dev/null;
      rm $FILE 2> /dev/null;
      cp $ORIGINAL "$FILE" 2> /dev/null;
    fi
  done
}

replaceLinks;
