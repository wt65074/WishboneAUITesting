#!/bin/bash

#installs the app, runs the instruments script, runs the parser, shuts down all devices, erases all devices, quits the simulator
while getopts i:p:n: option
do
case "${option}"
in
i) iOS=${OPTARG};;
p) PLATFORM=${OPTARG};;
n) NAME=${OPTARG};;
esac
done

cd ~/Desktop/Wishbone

echo "===================================Shutting Down Simulators==================================="
xcrun simctl list devices | grep -v '^[-=]' | grep -v "Shutdown" | cut -d "(" -f2 | cut -d ")" -f1 | xargs -I {} xcrun simctl shutdown "{}"

echo "===================================Erasing Simulators==================================="
xcrun simctl list devices | grep -v '^[-=]' | cut -d "(" -f2 | cut -d ")" -f1 | xargs -I {} xcrun simctl erase "{}"

echo "===================================BuildingWishbone.app==================================="
xcodebuild test -scheme Wishbone -destination platform="${PLATFORM}",OS=$iOS,name="${NAME}"

echo "===================================Building instruments.sh==================================="
cd ~/Desktop/AUITesting
UDID="$(xcrun instruments -s devices | grep "${iOS}" | grep "${NAME} (" | cut -d "[" -f2 | cut -d "]" -f1)"
touch instruments.sh
printf "instruments -t /Applications/Xcode.app/Contents/Applications/Instruments.app/Contents/PlugIns/AutomationInstrument.xrplugin/Contents/Resources/Automation.tracetemplate -w "${UDID}" " > instruments.sh
find ~/ -name "Wishbone.app" | head -1 | xargs echo -n  >> instruments.sh
echo " -e UIASCRIPT ~/Desktop/AUITesting/Wishbone.js -e UIARESULTSPATH ~/Desktop/AUITesting" >> instruments.sh

echo "===================================Running instruments.sh==================================="
sh instruments.sh

echo "===================================Running Parser.py==================================="
python parser.py -d "iOS ${iOS}, ${NAME}, ${PLATFORM}"

echo "===================================Removing Trace==================================="
rm -R "instrumentscli0.trace"

echo "===================================Shutting Down Simulators==================================="
xcrun simctl list devices | grep -v '^[-=]' | grep -v "Shutdown" | cut -d "(" -f2 | cut -d ")" -f1 | xargs -I {} xcrun simctl shutdown "{}"

echo "===================================Erasing Simulators==================================="
xcrun simctl list devices | grep -v '^[-=]' | cut -d "(" -f2 | cut -d ")" -f1 | xargs -I {} xcrun simctl erase "{}"

echo "===================================Quitting Simulators==================================="
osascript -e 'quit app "iOS Simulator"'
