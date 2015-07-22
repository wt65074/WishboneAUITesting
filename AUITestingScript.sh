#!/bin/bash
#main script in project: Run to run project
#runs CoreTestingScript.sh, tests if run succeeded, if not then it reruns and compares the output to replicate the error

OS_VERSION=8.4
PLATFORM='iOS Simulator'
NAME='iPhone 6'

cd ~/Desktop/AUITesting

#delete run 1 if it exists
if test -d Run\ 1; then

  rm -R Run\ 1

fi

#run the CoreTestingScript, supplying the platform (iOS or device), OS Version and the device
sh CoreTestingScript.sh -p 'iOS Simulator' -i 8.4 -n 'iPhone 6'

#get the last modifided folder starting with "Run "
FIRST_RUN="$(ls -t | grep '^[Run ]* ' -m 1)"

#cd into it
cd "$FIRST_RUN"

#test if Wishbone failed any tests
if grep -q 'However Wishbone failed testing:' RunSummary.txt; then

  echo "TESTING FAILED"

  cd ~/Desktop/AUITesting

  #run the CoreTestingScript, supplying the platform (iOS or device), OS Version and the device
  sh CoreTestingScript.sh -p 'iOS Simulator' -i 8.4 -n 'iPhone 6'

  #get the last modifided folder starting with "Run "
  SECOND_RUN="$(ls -t | grep '^[Run ]* ' -m 1)"

  #create paths to the first RunSummary and the second RunSummary
  FIRST_PATH=""$FIRST_RUN"/RunSummary.txt"
  SECOND_PATH=""$SECOND_RUN"/RunSummary.txt"

  #use diff to test for a difference in the two files, if there is wishbone it was probably a fluke
  if [ "$(diff "$FIRST_PATH" "$SECOND_PATH")" == "" ]; then

    echo "ERROR DETECTED"
    cd ~/Desktop/AUITesting

    #zip file, get a path to the zip and copy it to S3
    zip -r "$FIRST_RUN".zip "$FIRST_RUN"
    ZIP_ONE="$(ls -t | grep '.zip' -m 1)"
    aws s3 cp ~/Desktop/AUITesting/"$ZIP_ONE" s3://wishbone-auitesting/"$ZIP_ONE"

    #create a file name for the link (replaces : and spaces), add it to a link and print it to RunSummary.txt for the email
    FIRST_RUN_LINK_FILENAME=$(echo "$ZIP" | sed 's/\:/%3A/g' | sed 's/\ /+/g')
    FIRST_AWS_LINK="https://s3-us-west-1.amazonaws.com/wishbone-auitesting/"$FIRST_RUN_LINK_FILENAME""
    echo "\n$FIRST_AWS_LINK" >> ~/Desktop/AUITesting/"$FIRST_RUN"/RunSummary.txt

    #zip file, get a path to the zip and copy it to S3
    zip -r "$SECOND_RUN".zip "$SECOND_RUN"
    ZIP_TWO="$(ls -t | grep '.zip' -m 1)"
    aws s3 cp ~/Desktop/AUITesting/"$ZIP_TWO" s3://wishbone-auitesting/"$ZIP_TWO"

    #create a file name for the link (replaces : and spaces), add it to a link and print it to RunSummary.txt for the email
    SECOND_RUN_LINK_FILENAME=$(echo "$ZIP_TWO" | sed 's/\:/%3A/g' | sed 's/\ /+/g')
    SECOND_AWS_LINK="https://s3-us-west-1.amazonaws.com/wishbone-auitesting/"$SECOND_RUN_LINK_FILENAME""
    echo "\n$SECOND_AWS_LINK" >> ~/Desktop/AUITesting/"$SECOND_RUN"/RunSummary.txt

    echo "===================================Running Mailer.py==================================="
    python mailer.py -s ~/Desktop/AUITesting/"$SECOND_RUN"/RunSummary.txt

    #make a folder to hold old runs if it doesnt exist and move the runs into there, delete the zips
    mkdir -p Runs
    rm -R "$ZIP_ONE"
    mv "$FIRST_RUN" Runs
    rm -R "$ZIP_TWO"
    mv "$SECOND_RUN" Runs

  else

    echo -e "\nTEST OUTPUTS DIFFER, MOST LIKELY ISSUE WITH wishbone.js" >> "$SECOND_PATH"
    cd ~/Desktop/AUITesting

    #zip file, get a path to the zip and copy it to S3
    zip -r "$FIRST_RUN".zip "$FIRST_RUN"
    ZIP_ONE="$(ls -t | grep '.zip' -m 1)"
    aws s3 cp ~/Desktop/AUITesting/"$ZIP_ONE" s3://wishbone-auitesting/"$ZIP_ONE"

    #create a file name for the link (replaces : and spaces), add it to a link and print it to RunSummary.txt for the email
    FIRST_RUN_LINK_FILENAME=$(echo "$ZIP" | sed 's/\:/%3A/g' | sed 's/\ /+/g')
    FIRST_AWS_LINK="https://s3-us-west-1.amazonaws.com/wishbone-auitesting/"$FIRST_RUN_LINK_FILENAME""
    echo "\n$FIRST_AWS_LINK" >> ~/Desktop/AUITesting/"$FIRST_RUN"/RunSummary.txt


    #zip file, get a path to the zip and copy it to S3
    zip -r "$SECOND_RUN".zip "$SECOND_RUN"
    ZIP_TWO="$(ls -t | grep '.zip' -m 1)"
    aws s3 cp ~/Desktop/AUITesting/"$ZIP_TWO" s3://wishbone-auitesting/"$ZIP_TWO"

    #create a file name for the link (replaces : and spaces), add it to a link and print it to RunSummary.txt for the email
    SECOND_RUN_LINK_FILENAME=$(echo "$ZIP_TWO" | sed 's/\:/%3A/g' | sed 's/\ /+/g')
    SECOND_AWS_LINK="https://s3-us-west-1.amazonaws.com/wishbone-auitesting/"$SECOND_RUN_LINK_FILENAME""
    echo "\n$SECOND_AWS_LINK" >> ~/Desktop/AUITesting/"$SECOND_RUN"/RunSummary.txt

    echo "===================================Running Mailer.py==================================="
    python mailer.py -s ~/Desktop/AUITesting/"$SECOND_RUN"/RunSummary.txt

    #make a folder to hold old runs if it doesnt exist and move the runs into there, delete the zips
    mkdir -p Runs
    rm -R "$ZIP_ONE"
    mv "$FIRST_RUN" Runs
    rm -R "$ZIP_TWO"
    mv "$SECOND_RUN" Runs

  fi

else

  echo "TESTS SUCCEEDED"
  cd ~/Desktop/AUITesting

  zip -r "$FIRST_RUN".zip "$FIRST_RUN"
  ZIP="$(ls -t | grep '.zip' -m 1)"
  aws s3 cp ~/Desktop/AUITesting/"$ZIP" s3://wishbone-auitesting/"$ZIP"

  FIRST_RUN_LINK_FILENAME=$(echo "$ZIP" | sed 's/\:/%3A/g' | sed 's/\ /+/g')
  FIRST_AWS_LINK="https://s3-us-west-1.amazonaws.com/wishbone-auitesting/"$FIRST_RUN_LINK_FILENAME""
  echo "\n$FIRST_AWS_LINK" >> ~/Desktop/AUITesting/"$FIRST_RUN"/RunSummary.txt

  echo "===================================Running Mailer.py==================================="
  python mailer.py -s ~/Desktop/AUITesting/"$FIRST_RUN"/RunSummary.txt
  
  #make a folder to hold old runs if it doesnt exist and move the runs into there, delete the zips
  mkdir -p Runs
  rm -R "$ZIP_ONE"
  mv "$FIRST_RUN" Runs

fi
