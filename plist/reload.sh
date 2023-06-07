#!/usr/bin/env bash

# specific
plistlabel=nl.jcroonen.gpxserver
# general
plistfile=$plistlabel.plist
targetfolder=~/Library/LaunchAgents
target=$targetfolder/$plistfile

echo "# unload"
launchctl unload $target
defaults read $target

echo "# copy"
cp $plistfile $targetfolder

echo "# load"
launchctl load -w $target

echo "# start"
launchctl start $plistlabel
