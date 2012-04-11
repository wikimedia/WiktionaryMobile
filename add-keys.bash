#!/bin/bash

# FBAPI Key
echo -n "Enter FB API Key: "
read FBKEY

echo -n "Enter the RIL API Key: "
read RILKEY

sed -i -e "s/\[RIL-API-KEY\]/$RILKEY/" Wikipedia-iOS/Plugins/ReadItLater/ReadItLaterLite.m
sed -i -e "s/\[FB-APP-ID\]/$FBKEY/" Wikipedia-iOS/Wikipedia-iOS-Info.plist
sed -i -e "s/\[FB-APP-ID\]/$FBKEY/" assets/www/ios/platform.js
