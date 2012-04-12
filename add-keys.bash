#!/bin/bash

# FBAPI Key
echo -n "Enter FB API Key: "
read FBKEY

echo -n "Enter the RIL API Key: "
read RILKEY

sed -i.bak "s/\[RIL-API-KEY\]/$RILKEY/" Wikipedia-iOS/Plugins/ReadItLater/ReadItLaterLite.m
sed -i.bak "s/\[FB-APP-ID\]/$FBKEY/" Wikipedia-iOS/Wikipedia-iOS-Info.plist
sed -i.bak "s/\[FB-APP-ID\]/$FBKEY/" assets/www/ios/platform.js
