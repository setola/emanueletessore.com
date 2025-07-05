---
title: 'How to install Kodi on Ubuntu 15.10'
date: Sat, 14 Nov 2015 18:51:31 +0000
draft: false
tags: ['Server Administration']
---

Well one of these days it should happen... My **Open Source Media Center** pc had an hardware problem, so I've seized
the moment also for a software update. So I've noticed that my preferred **Open Source Home Theatre Software** has
changed name: my beloved **XBMC** become my new best friend **Kodi**. They use Lord of the Rings names, so I'm perfectly
fine with em!

## Install

I really like to **install Ubuntu** from the **server edition** wich has only what I really need: bash and ssh. But if
you're scared of the CLI, you can always install the Desktop version and click around with your mouse! Installing Ubuntu
is a charm: use an usb key
with [Universal USB Installer](http://www.pendrivelinux.com/universal-usb-installer-easy-as-1-2-3) it will take care of
downloading the ISO and set a bootable device on you usb stick. Plug it into the HTPC and enjoy the wizard. Setting up
Kodi on a fresh **Ubuntu server 15.10** install is really simple. Just run

```bash
sudo apt-get install kodi
```

and you're done!

## Start Kodi at boot

For make **Kodi start when the htpc is booted** up we need a simple **systemctl script**. Run

```bash
sudo nano /etc/systemd/system/kodi.service
```

and use shift-ins to paste this inside the buffer:

```systemd
[Unit]
Description = Kodi Media Center

# if you don't need the MySQL DB backend, this should be sufficient

After = systemd-user-sessions.service network.target sound.target

# if you need the MySQL DB backend, use this block instead of the previous

# After = systemd-user-sessions.service network.target sound.target mysql.service

# Wants = mysql.service

[Service]
User = myuser
Group = myuser
Type = simple
#PAMName = login # you might want to try this one, did not work on all systems
ExecStart = /usr/bin/xinit /usr/bin/kodi-standalone -- -nocursor :0
Restart = on-abort
RestartSec = 5

[Install]
WantedBy = multi-user.target
```

change 'myuser' with the name the user you inserted while installing Ubuntu and press _ctrl+x_ to quit and _y_ to save.
Systemctl will also take care of restarting the process in case of failures\\crashes. Nice to have. To start Kodi you
will have to run:

```bash
systemctl start kodi
```

## Troubleshooting

### How to fix "X: user not authorized to run the X server, aborting."

If you run startx by root everything works just fine, but when you try to use systemctl nothing happens. The output of

```bash
systemctl status kodi
```

looks like this:

```systemctl
● kodi.service - Kodi Media Center
Loaded: loaded (/etc/systemd/system/kodi.service; enabled; vendor preset: enabled)
Active: active (running) since sab 2015-11-14 19:42:24 CET; 6s ago
Main PID: 3098 (xinit)
CGroup: /system.slice/kodi.service
└─3098 /usr/bin/xinit /usr/bin/kodi-standalone -- -nocursor :0

nov 14 19:42:24 IlMedia systemd\[1\]: Started Kodi Media Center.
nov 14 19:42:24 IlMedia xinit\[3098\]: X: user not authorized to run the X server, aborting.

```

Well this is caused by a security configuration for X server. Just choose '_Anybody_' when prompted by this command:

```bash
sudo dpkg-reconfigure x11-common
```

### How to fix "ERROR: Unable to load libcurl.so.4"

On the first run Kodi was rebooting without any explanation. A quick look to the logfile, in my
case `/home/setola/kodi_crashlog-20151114_183523.log`, revealed the true reason:

```log
**ERROR: Unable to load libcurl.so.4, reason: libcurl.so.4: cannot open shared object file: No such file or
directory**
```  

While waiting for the developers to find a way to correct the library name we can fix easily by running

```bash
sudo ln -s /usr/lib/x86\_64-linux-gnu/libcurl-gnutls.so.4 /usr/lib/x86\_64-linux-gnu/libcurl.so.4
```