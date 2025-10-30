---
title: "Fixing Cilium ARP Cache Bug on DigitalOcean DOKS (MySQL Private Network Timeout)"
date: 2025-10-30
tags: ["kubernetes", "digitalocean", "mysql", "cilium", "networking", "bugfix"]
summary: "How to diagnose and temporarily fix the Cilium ARP cache issue on DigitalOcean Kubernetes (DOKS) that causes MySQL private network connections to fail."
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-original.svg
---

## Overview

Recently one of the Kubernetes cluster I manage on DigitalOcean began experiencing connection issues to the **Managed MySQL** database over the **private VPC network**.

Private connections consistently timed out, while public network connections worked fine.

After several tests and a support ticket with DigitalOcean, it turned out that the issue was caused by a **known Cilium bug** affecting ARP (Address Resolution Protocol) cache behavior.

## Symptoms

* Application pods could not connect to the database through the private hostname.  
* Monitoring alerts triggered due to repeated connection errors.  
* No issues observed when using the public endpoint.  
* No recent changes to the application or infrastructure.  

At the same time, **multiple alerts were fired** indicating database connectivity failures.

## Root Cause

The DigitalOcean support team confirmed that the issue was caused by **stale ARP entries** on certain nodes due to a **Cilium networking bug**.

**Upstream references:**

* 🧩 [Cilium Issue #34503 — Stale neighbor entry keeps breaking nodeport return packets](https://github.com/cilium/cilium/issues/34503)  
* 🧪 [Fix — bpf: fib: always use bpf_redirect_neigh() when available](https://github.com/cilium/cilium/pull/37725)

The bug was fixed in **Cilium 1.19.0-pre.0**, but **DigitalOcean Kubernetes (DOKS) 1.34** currently runs **Cilium 1.18**, which **does not yet include the patch**.

Until the DOKS platform upgrades its Cilium version, the workaround must be applied manually or automated.

## Manual Workaround

DigitalOcean initially suggested the following steps:

```bash
kubectl apply -f https://raw.githubusercontent.com/digitalocean/doks-debug/master/k8s/daemonset.yaml
kubectl -n kube-system exec -it <doks-debug-pod-name> -- /bin/bash
chroot /host /bin/bash
sudo ip -s -s neigh flush all
exit
exit
```

This manually flushes the stale ARP cache on all nodes, restoring private network connectivity between pods and managed databases.

## Automated Workaround Using a Custom DaemonSet

To make the workaround persistent and automatic, you can deploy a DaemonSet that periodically runs the ARP flush command on each node.

The following YAML is based on DigitalOcean’s doks-debug DaemonSet but adds an infinite loop to automatically clean up the ARP cache every hour.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: doks-debug-auto-fix
  namespace: kube-system
  labels:
    app.kubernetes.io/name: doks-debug
    app.kubernetes.io/part-of: doks-debug
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: doks-debug
  template:
    metadata:
      labels:
        app.kubernetes.io/name: doks-debug
    spec:
      hostNetwork: true
      hostPID: true
      tolerations:
        - operator: Exists
      restartPolicy: Always
      containers:
        - name: doks-debug
          image: digitalocean/doks-debug:latest
          imagePullPolicy: Always
          securityContext:
            privileged: true
          command:
            - /bin/bash
            - -c
            - |
              echo "[doks-debug-auto-fix] Started: automatic ARP cache flush every 3600 seconds"
              while true; do
                echo "[doks-debug-auto-fix] Flushing ARP cache..."
                chroot /host /bin/bash -c "ip -s -s neigh flush all" || echo "[doks-debug-auto-fix] Command failed"
                echo "[doks-debug-auto-fix] Sleeping for 3600 seconds..."
                sleep 3600
              done
          volumeMounts:
            - name: host-root
              mountPath: /host
      volumes:
        - name: host-root
          hostPath:
            path: /
```

This DaemonSet creates a pod on each node that automatically executes the ARP cleanup command every hour, ensuring network stability even after node restarts or replacements.

## Official Alternative Provided by DigitalOcean

Following further discussion, DigitalOcean shared an official non-destructive ARP pruning script that can be safely deployed as an alternative to the manual or automated methods above.

Repository:
👉 https://github.com/okamidash/arp-doks-fix

This script periodically prunes stale ARP entries and is designed to be compatible with existing DOKS clusters.

## Summary

* The ARP issue is a known Cilium networking bug, not a DigitalOcean-specific problem.
* The bug is fixed in Cilium ≥ 1.19, but DOKS 1.34 still uses Cilium 1.18.
* You can use either:
  * The manual fix (via doks-debug DaemonSet), or
  * The automated cleanup DaemonSet (as shown above), or
  * The official DigitalOcean pruning script from okamidash/arp-doks-fix

## References

* [DigitalOcean DOKS Debug DaemonSet](https://github.com/digitalocean/doks-debug)
* [okamidash/arp-doks-fix Repository](https://github.com/okamidash/arp-doks-fix)
* [Cilium Issue #34503](https://github.com/cilium/cilium/issues/34503)
* [Cilium Pull Request #37725](https://github.com/cilium/cilium/pull/37725)