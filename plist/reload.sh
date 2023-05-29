#!/usr/bin/env bash
plistname=nl.jcroonen.gpxserver.plist
plist=~/Dev/node-gpx-server/plist/ares/$plistname
target=~/Library/LaunchAgents/$plistname

echo "# unload"
launchctl unload $target
defaults read $target

echo "# copy"
cp $plist ~/Library/LaunchAgents

echo "# load"
launchctl load -w $target

echo "# start"
launchctl start nl.jcroonen.booklibrary20
