---
title: 'How to replace Sendmail with Gmail smtp on Ubuntu server'
date: Sun, 09 Dec 2012 20:56:08 +0000
draft: false
tags: ['PHP', 'SMTP', 'Server-Administration']
categories: ['Howto', 'Ubuntu']
disqus_url: http://www.emanueletessore.com/how-to-configure-msmtp-as-a-gmail-relay-on-ubuntu-server/
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original.svg
---

Today my goal was to be able to **send mails from PHP** from my web-server **using Gmail smtp**.

1. My server runs on **Apache with vhosts**: I need a **separate mailbox for every domain**.
2. I don' want to manage a MTA because it's resource and time expensive, so I want to **send mails trough a Gmail
   account**.
3. I want the system to be **fast and easy to maintain**.

The standard packages such as postfix, sendmail, qmail etc doesn't meet the last two requirements, so I had to **choose
an alternative to postfix**: [MSMTP](http://msmtp.sourceforge.net "Msmtp: An SMTP client")

## Open a Gmail account

My suggestion is to not use your personal Gmail account, so probably will be a good idea to open a brand new one
dedicated to the server.

## Install MSMTP

That's an easy task: use apt-get to achieve it.

```bash
sudo apt-get install msmtp ca-certificates
```

With this command we have installed also some authority certificates useful to verify SSL connection.

## Configure MSMTP

The default config files for MSMTP are located in `SYSCONFDIR/msmtprc` and `~/.msmtprc`.
Neither the first or the second was created by apt, so I preferred to have a folder in `/etc`
where store more than one config file if needed. Same for the logs.

```bash
sudo mkdir /etc/msmtp
sudo mkdir /var/log/msmtp
```

Then I've created the config file: _`citex0`_ is the name of my server, change it.

```bash
sudo touch /etc/msmtp/citex0
sudo nano /etc/msmtp/citex0
```

this is what's inside: remember to change your mailbox and password

```conf
# Define here some setting that can be useful for every account
defaults
logfile /var/log/msmtp/general.log

# Settings for citex0 account

account citex0
protocol smtp
host smtp.gmail.com
tls on
tls\_trust\_file /etc/ssl/certs/ca-certificates.crt
port 587
auth login
user my\_server\_account@gmail.com
password my\_server\_password
from my\_server\_account@gmail.com
logfile /var/log/msmtp/citex0.log

# If you don't use any "-a" parameter in your command line,

# the default account "citex0" will be used.

account default: citex0
```

## Test MSMTP

change the `your_personal_mail@gmail.com` with your own recipient, the file path if needed and run:

```bash
echo -e "Subject: Test Mail\\r\\n\\r\\nThis is a test mail" \
  | msmtp --debug --from=default -t your_personal_mail@gmail.com --file=/etc/msmtp/citex0
```

## Troubleshooting MSMTP

Probably the first time you'll try to send a mail to Google's smtp from a server's ip, BigG will deactivate your
account. This is the result on the log or command line output:

```
<-- 535-5.7.1 Please log in with your web browser and then try again. Learn more at
<-- 535 5.7.1 https://support.google.com/mail/bin/answer.py?answer=78754 b49sm36363995eem.16
msmtp: authentication failed (method LOGIN)
msmtp: server message: 535-5.7.1 Please log in with your web browser and then try again. Learn more at
msmtp: server message: 535 5.7.1 https://support.google.com/mail/bin/answer.py?answer=78754 b49sm36363995eem.16
msmtp: could not send mail (account default from /etc/msmtp/citex0)
```

To avoid this you only need to verify your Google Account by inserting your phone.
Simply try to login with your server account and you'll be prompted for your phone number. 
Insert the right one and they will send you a code to unlock your server account. This is what happens when everything is alright!

```
<-- 235 2.7.0 Accepted
--> MAIL FROM: <-- 250 2.1.0 OK e2sm36547326eeo.8
--> RCPT TO: <-- 250 2.1.5 OK e2sm36547326eeo.8
--> DATA
<-- 354 Go ahead e2sm36547326eeo.8
--> Subject: Test Mail
-->
--> This is a test mail
--> .
<-- 250 2.0.0 OK 1355059058 e2sm36547326eeo.8
--> QUIT
<-- 221 2.0.0 closing connection e2sm36547326eeo.8

```

Anand Rai told me there is a way to do it without entering a captcha or password using web browser.

*   Allow low security app login from the [Google Account Security Panel](https://www.google.com/settings/security/lesssecureapps)
*   Allow device from your machine [from here](https://accounts.google.com/b/0/DisplayUnlockCaptcha), After this gmail will allow your server to send email.
*   Also check [the activity panel](https://security.google.com/settings/security/activity) just to be sure the server is listed

I suggest to not use this on production server for the security implications coming from enabling the "less secure apps". BTW thanks Anand!

## Configuring Apache\\PHP to use MSMTP

To force PHP to use MSMTP when called by Apache you have to set the environment variable `sendmail_path`.

```
php_admin_value sendmail_path "/usr/bin/msmtp --debug --from=citex0 --file=/etc/msmtp/citex0 -t"
```

At this point I had to fix some permission and owners

```bash
sudo chmod 600 /etc/msmtp/citex0 
sudo chown -R www-data:www-data /var/log/msmtp 
sudo chown -R www-data:www-data /etc/msmtp/
```

## Reference

The official documentation of the project: [http://msmtp.sourceforge.net/documentation.html](http://msmtp.sourceforge.net/documentation.html "Msmtp: An SMTP client")