#!/bin/bash

rm -rf servers/{markets,notifications,status}/services
mkdir servers/{markets,notifications,status}/services

ln -s /Users/tylershambora/Code/Personal/pav2tty5lo7geycf/services/*  firebase/functions/services

for dir in markets notifications status; do
  ln -s /Users/tylershambora/Code/Personal/pav2tty5lo7geycf/services/*  servers/${dir}/services
  ln -s /Users/tylershambora/Code/Personal/pav2tty5lo7geycf/servers/shared/*  servers/${dir}/services
  ln -s /Users/tylershambora/Code/Personal/pav2tty5lo7geycf/credentials.firebase.json servers/${dir}
done
