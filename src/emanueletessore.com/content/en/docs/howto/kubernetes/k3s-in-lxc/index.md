---
title: "K3S in LXC"
date: 2022-07-06T10:35:23Z
draft: false
tags: ['Kubernetes', 'LXC', 'Proxmox']
categories: ['howto', 'Kubernetes']
---

## Configure host

on Proxmox host

```bash 
sudo sysctl vm.swappiness=0
sudo swapoff -a
sudo sysctl net.ipv4.ip_forward=1
sudo sysctl net.ipv6.conf.all.forwarding=1
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/g' /etc/sysctl.conf
sudo sed -i 's/#net.ipv6.conf.all.forwarding=1/net.ipv6.conf.all.forwarding=1/g' /etc/sysctl.conf
```

## Containers

Create an LXC container in the Proxmox

* Uncheck `unprivileged container`
* In memory, set swap to 0

modify config file:
Open `/etc/pve/lxc/$VMID.conf` and append:

```bash 
lxc.apparmor.profile: unconfined
lxc.cap.drop:
lxc.mount.auto: "proc:rw sys:rw"
lxc.cgroup2.devices.allow: c 10:200 rwm
```

## Configure container

inside the container run:

```bash 
echo '#!/bin/sh -e
ln -s /dev/console /dev/kmsg
mount --make-rshared /' > /etc/rc.local
chmod +x /etc/rc.local
reboot
```

## K3S Install

on first node:

```bash 
curl -sfL https://get.k3s.io | K3S_TOKEN=asdlalla sh -s - server --cluster-init
```

other nodes:

```bash
curl -sfL https://get.k3s.io | sh -s - server --server https://192.168.82.20:6443 --token asdlalla
```

## Kubectl autocomlete

```bash
kubectl completion bash > /usr/share/bash-completion/completions/kubectl
```

## Enable ip_forward for loadbalancer service

Change the DeamonSet svclb-traefik by adding this to the **pod** (beware, not the containers)

```yaml
      securityContext:
        sysctls:
          - name: net.ipv4.ip_forward
            value: "1"
```

## Daemon Customization

on control plane nodes

```bash
nano /etc/systemd/system/k3s.service
```

```
ExecStart=/usr/local/bin/k3s \
    server \
        '--cluster-init' \
        '--tls-san' '93.56.115.38' \
        '--tls-san' '192.168.82.20' \
        '--tls-san' '192.168.82.21' \
        '--tls-san' '192.168.82.22' \
        '--kubelet-arg=allowed-unsafe-sysctls=net.ipv4.ip_forward' \
```

```bash
systemctl daemon-reload
systemctl restart k3s
```

on workers nodes

```bash
nano /etc/systemd/system/k3s-agent.service
```

```
ExecStart=/usr/local/bin/k3s \
    agent \
        '--kubelet-arg=allowed-unsafe-sysctls=net.ipv4.ip_forward' \
```

```bash
systemctl daemon-reload
systemctl restart k3s-agent.service
```

## Resources

https://davegallant.ca/blog/2021/11/14/running-k3s-in-lxc-on-proxmox/
https://github.com/k3s-io/k3s/issues/2233
https://github.com/kubernetes/kubernetes/issues/92266