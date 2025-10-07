---
title: 'How to setup a Node.js and Arduino development environment under Ubuntu Server 12.04'
date: Sun, 09 Sep 2012 20:43:08 +0000
draft: false
tags: ['Arduino', 'arduino', 'node.js', 'Node.js', 'ubuntu']
disqus_url: http://www.emanueletessore.com/how-to-setup-a-node-js-and-arduino-development-environment-under-ubuntu-server-12-04/
---

Some nights ago I've decided to start learning something about a nice project started by Ryan Lienhart Dahl aiming to **
run javascript code serverside**: its name is **Node.js** and it's designed for writing highly scalable Internet
application using event-driven asynchronous IO.

My final goal is to have a central server commanding one or more Arduino to have my home automated as much as possible.

## Setup an Ubuntu Server

First of all I had to **setup an ubuntu server** on an old Asus AT3GCI.

This step is really easy: you have to make a bootable usb key with Pen Drive Linux.

This is the howto you eventually need:
[http://www.ubuntu.com/download/help/create-a-usb-stick-on-windows](http://www.ubuntu.com/download/help/create-a-usb-stick-on-windows "create an usb stick on windows")

You have to choose this distribution from the dropdown: `Ubuntu Server 12.04 Installer` When done we have to set `sshd`
up and running to let us connect to the server.

```bash
sudo apt-get install openssh-server
```

This was enough for me, but if you need something more you can find a good howto here

[http://help.ubuntu-it.org/6.06/ubuntu/serverguide/it/openssh-server.html](http://help.ubuntu-it.org/6.06/ubuntu/serverguide/it/openssh-server.html "Install OpenSSH on Ubuntu Server")

If you use **putty on windows** you may have some **charset issue** with non-standard chars. To fix this go on:

`window` - `translation` - `remote character` and set: `UTF-8`

## Setup Node.js Environment

To have **Node Js up to date on your Ubuntu system** you have to use
[nvm (Node Version Manager)](https://github.com/creationix/nvm "Node Version Manager on GitHub").

```bash
sudo apt-get install git
git clone git://github.com/creationix/nvm.git ~/.nvm
echo ". ~/.nvm/nvm.sh" >> ~/.bashrc
nvm install v0.8.8
nvm alias default v0.8.8
```

This will install Git, clone the repository for nvm, run nvm on every login, install version 0.8.8 of node and then use
as default.

To check if node is working use the code from this page:
[http://nodejs.org/api/synopsis.html](http://nodejs.org/api/synopsis.html "Node Js - example of http server").

If you want to use port 80, default for http, you have to start node from root, cause under Linux port below 1024 can be
opened only by root.

This means you have to install another nvm on the root account. Or you can route another port to the 80 with iptables:

```bash
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
```

## Connect Arduino

Take your usb cable and **connect arduino to the development Ubuntu server**. Use `dmesg` to know which device it will
be associated to.

```bash
dmesg | tail
[...]
[ 44.184049] usb 2-1: new full-speed USB device number 2 using uhci_hcd
[ 44.436617] cdc_acm 2-1:1.0: ttyACM0: USB ACM device
[ 44.439327] usbcore: registered new interface driver cdc_acm
[ 44.439334] cdc_acm: USB Abstract Control Model driver for USB modems and ISDN adapters
[ 46.032089] usb 2-1: USB disconnect, device number 2
```

Well, now a little check to be sure **serial communication is up running**:

```bash
echo 'asd' > /dev/ttyACM0
```

rx and tx led on the arduino board will blink. If the system returns an access error your user probably is not in
the `dialout` group.

Add it:

```bash
addgroup dialout
```

If you need an example on how the serial communication works on Arduino take a look here:
[http://arduino.cc/en/Serial/Read](http://arduino.cc/en/Serial/Read "Serial Read on Arduino Board")
I've used `minicom` to communicate via serial:

```bash
apt-get install minicom
```

setup: [http://www.cyberciti.biz/tips/connect-soekris-single-board-computer-using-minicom.html](http://www.cyberciti.biz/tips/connect-soekris-single-board-computer-using-minicom.html "Use minicom to communicate via serial")

## Develop something!

Here we go: we're ready to write some code in Node.js and develop something that will be useful to our life :)

What I've done since now it's an application that let you switch a led on and off from the web.

Recently I've added also an RGB led you can set the color by entering an hex into a form.

Here's the repo: [https://github.com/setola/SetoLan](https://github.com/setola/SetoLan "SetoLan Project on GitHub")