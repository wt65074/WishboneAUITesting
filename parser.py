#!/usr/bin/python

import plistlib
import os
import glob
import shutil
import datetime
import re
import sys, getopt

def main(argv):

    try:
        opts, args = getopt.getopt(argv, "d:", ["Device="])
    except getopt.GetoptError:
        usage()
        print "Cat animal"
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-d", "--Device"):
            global deviceInfo
            deviceInfo = arg

if __name__ == "__main__":
    main(sys.argv[1:])



seperator = " > "

pl = plistlib.readPlist('/Users/wtobey/Desktop/AUITesting/Run 1/Automation Results.plist')

samples = pl['All Samples']

#stores type=4 messages without the seperator
startedTests = []
#stores type=5 messages without the seperator
passedTests = []

#stores type=4 messages with the seperator
startedSubtests = []
#stores type=5 messages with the seperator
passedSubtests = []

#RunSummary header
f = open("RunSummary.txt", "w+")
f.write("WISHBONE TESTING COMPLETED\n" + deviceInfo + "\n\n")
f.close()

#for file naming
startDateTime = samples[0]['Timestamp']

for value in enumerate(samples):

    if not 'Message' in value[1]:
        #skip anything without a message
        continue

    if seperator in value[1]['Message']:

        if value[1]['Type'] == 5:
            passedSubtests.append(value[1]['Message'])

        if value[1]['Type'] == 4:
            startedSubtests.append(value[1]['Message'])

    else:

        if value[1]['Type'] == 5:
            passedTests.append(value[1]['Message'])

        if value[1]['Type'] == 4:
            startedTests.append(value[1]['Message'])

#stores all messages from [startedTests] that dont match with a message in [passedTests]
incompleteTests = []
#stores all messages from [startedTests] that match with a message in [passedTests]
completedTests = []

#stores all messages from [startedSubtests] that dont match with a message in [passedSubtests]
incompleteSubtests = []
#stores all messages from [startedSubtests] that match with a message in [passedSubtests]
completedSubtests = []

for string in enumerate(startedSubtests):
    if string[1] not in passedSubtests:
        incompleteSubtests.append(string[1])

    else:
        passedSubtests.remove(string[1])
        completedSubtests.append(string[1])

for string in enumerate(startedTests):

    if string[1] not in passedTests:
        incompleteTests.append(string[1])

    else:
        passedTests.remove(string[1])
        completedTests.append(string[1])

for string in enumerate(completedTests):

    message = "Wishbone passed testing of: " + string[1]

    #retrieves a subtest message from subtests if string is in contained in its message
    specificCompleteSubtests = [s for s in completedSubtests if string[1] in s]
    specificIncompleteSubtests = [s for s in incompleteSubtests if string[1] in s]

    #add to message with all completed subtests with the proper headers
    for subtestString in enumerate(specificCompleteSubtests):
        print subtestString
        subtest = re.compile(seperator).split(subtestString[1])[1]

        message = message + "\nSUBTEST - " + subtest + ": Passed"

    #add to message with all incomplete subtests with the proper headers
    for subtestString in enumerate(specificIncompleteSubtests):
        print subtestString
        subtest = re.compile(seperator).split(subtestString[1])[1]

        message = message + "\nSUBTEST - " + subtest + ": Failed"

    #append the message to RunSummary.txt
    f = open("RunSummary.txt", "a+")
    f.write(message + "\n")
    f.close()

#test if any tests were started and not completed (failed)
if len(incompleteTests) == 0:

    f = open("RunSummary.txt", "a+")
    f.write("\nALL TESTS SUCCEEDED")
    f.close()

else:

    message = "However Wishbone failed testing: "

    f = open("RunSummary.txt", "a+")
    f.write(message)
    f.close()

for string in enumerate(incompleteTests):

    message = "\n " + string[1]

    #retrieves the string from subtests if the test is in its name
    specificCompleteSubtests = [s for s in completedSubtests if string[1] in s]
    specificIncompleteSubtests = [s for s in incompleteSubtests if string[1] in s]

    #add to message with all complete subtests with the proper headers
    for subtestString in enumerate(specificCompleteSubtests):
        print subtestString
        subtest = re.compile(seperator).split(subtestString[1])[1]

        message = message + "\nSUBTEST - " + subtest + ": Passed"

    #add to message with all incomplete subtests with the proper headers
    for subtestString in enumerate(specificIncompleteSubtests):
        print subtestString
        subtest = re.compile(seperator).split(subtestString[1])[1]

        message = message + "\nSUBTEST - " + subtest + ": Failed"

    #append the message to RunSummary.txt
    f = open("RunSummary.txt", "a+")
    f.write(string[1])
    f.close()

#get a new folder for the run, create it
dirPath = "/Users/wtobey/Desktop/AUITesting/Run " + startDateTime.strftime("%Y-%m-%d %H:%M:%S")
os.mkdir(dirPath)

#enumerate all tests to create subfolders in dirPath
for string in enumerate(completedTests):
    path = dirPath + "/" + string[1]
    #if tests appear twice, name them by incrementally appending an int
    if os.path.exists(path):
        count = 1
        path += " "
        path += str(count)
        while os.path.exists(path):
            count += 1
            base = count / 10 + 1
            path = path[:-base]
            path += " "
            path += str(count)
            pass

    #create new directory
    os.mkdir(path)

    #get all images from the run containing the test name
    globPath = "/Users/wtobey/Desktop/AUITesting/Run 1/" + string[1] + "*.png"

    #glob gets everything with the test in it
    for retrievedPath in glob.glob(globPath):

        print "retrievedPath" + retrievedPath

        #checks to see if it has a subtest
        if seperator in retrievedPath:
            #enumerates the subtest
            for s in (completedSubtests + incompleteSubtests):
                #tests if it matchs
                if s in retrievedPath:
                    print "matching" + s
                    subtest = re.compile(seperator).split(s)[1]
                    print "NEW PATH:" + path + "/" + subtest
                    #create a new directory if need be
                    if not os.path.exists(path + "/" + subtest):
                        os.mkdir(path + "/" + subtest)
                    #move the file to the folder, ensuring no matching files exist
                    if not os.path.exists(path + "/" + subtest + "/" + os.path.basename(retrievedPath)):
                        shutil.move(retrievedPath, path + "/" + subtest)

        else:
            shutil.move(retrievedPath, path)

#move the run summary to the new directory
shutil.move("RunSummary.txt", dirPath)

#change Run 1 to ArchivedRun and move it into dirPath
os.rename("Run 1", "ArchivedRun " + startDateTime.strftime("%Y-%m-%d %H:%M:%S"))
shutil.move("ArchivedRun " + startDateTime.strftime("%Y-%m-%d %H:%M:%S"), dirPath)
