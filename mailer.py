#!/usr/bin/python

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
import os
import sys, getopt
def main(argv):

    try:
        opts, args = getopt.getopt(argv, "s:", ["RunSummary="])
    except getopt.GetoptError:
        print "Misused Opts"
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-s", "--RunSummary"):
            global inputFile
            inputFile = arg

if __name__ == "__main__":
    main(sys.argv[1:])

msg = MIMEMultipart()
msg['Subject'] = 'WISHBONE AUITESTING COMPLETED'
msg['From'] = "wtobey@science-inc.com"
msg['To'] = "wt65074@gmail.com"

summary = open(inputFile, 'r')

body = MIMEText(summary.read())
summary.close()
msg.attach(body)

mailer = smtplib.SMTP()
mailer.connect("smtp.gmail.com", "submission")
mailer.starttls()
mailer.ehlo()
mailer.login('wtobey@science-inc.com', 'eighTnine9one!')
mailer.sendmail('wtobey@science-inc.com', 'wtobey@bwscampus.com', msg.as_string())
mailer.close()
