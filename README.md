# WishboneAUITesting

#In Terminal:

cd to this directory
<br />cd to atlassian-bamboo-5.9.1
<br />type "sh bin/start-bamboo.sh", return

In your browser go to http://localhost:8085<br />
Sign in in the top right, probably will make another user name and pass<br />
Once signed in go to My Bamboo, click on the start arrow next to Build and Test

#What everything does:

Wishbone.js: Contains the script used to run the tests
<br />CoreTestingScript.sh: Clears the simulators, builds the project, runs the tests, clears the simulators again, and runs parser.py
<br />parser.py: Creates the RunSummary.txt, organizes all the screenshots
<br />AUITestingScript.sh: Runs CoreTestingScript.sh, tests the output of the RunSummary.txt, if it fails rerun to duplicate the issue, zip and copy the output to S3
<br />mailer.py: Sends an email with the RunSummary.txt as the body, contains a link to the S3 download
