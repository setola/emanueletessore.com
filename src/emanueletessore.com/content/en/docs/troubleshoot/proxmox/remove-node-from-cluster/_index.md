---
title: "How to Remove a Proxmox Node from a Cluster"
date: 2024-10-14T15:48:24Z
draft: false
tags: ['Proxmox', 'Cluster', 'Node Management']
categories: ['Troubleshoot', 'Proxmox']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/proxmox/proxmox-plain-wordmark.svg
          
---

Removing a Proxmox node from a cluster is a critical operation that requires careful planning and execution. This guide provides a comprehensive step-by-step process to safely remove a node without affecting cluster stability.

## Prerequisites

- Administrative access to all cluster nodes
- Ensure the node to be removed is powered on and accessible
- Backup all virtual machines and containers running on the node
- Verify cluster quorum requirements will be maintained after removal

## Important Considerations

⚠️ **Warning**: Removing a node from a Proxmox cluster is irreversible. Ensure you have:
- Migrated or backed up all VMs/containers
- No shared storage dependencies on the node
- Alternative nodes to maintain quorum

## Step-by-Step Removal Process

### 1. Migrate Virtual Machines and Containers

Before removing the node, migrate all running VMs and containers to other cluster nodes:

```bash path=null start=null
# List all VMs on the node to be removed
pvesh get /cluster/resources --type vm --node <node-name>

# Migrate a VM to another node
qm migrate <vmid> <target-node>

# Migrate a container to another node
pct migrate <ctid> <target-node>
```

### 2. Stop All Services on the Target Node

On the node to be removed, stop all Proxmox services:

```bash path=null start=null
# Stop Proxmox services
systemctl stop pve-cluster
systemctl stop corosync
systemctl stop pvedaemon
systemctl stop pveproxy
systemctl stop pvestatd
```

### 3. Remove Node from Cluster Configuration

From any remaining cluster node, remove the target node:

```bash path=null start=null
# Check current cluster status
pvecm status

# Remove the node from cluster
pvecm delnode <node-name>
```

### 4. Update Corosync Configuration

Verify and update the corosync configuration:

```bash path=null start=null
# Check corosync configuration
cat /etc/pve/corosync.conf

# The node should no longer appear in the nodelist
# If it still appears, manually edit the file (advanced users only)
```

### 5. Clean Up Storage References

Remove any storage configurations specific to the removed node:

```bash path=null start=null
# List storage configuration
pvesm status

# Remove node-specific storage if needed
pvesm remove <storage-id>
```

### 6. Verify Cluster Health

After removal, verify the cluster is functioning correctly:

```bash path=null start=null
# Check cluster status
pvecm status
pvecm nodes

# Verify quorum
corosync-quorumtool -s

# Check cluster resources
pvesh get /cluster/resources
```

## Post-Removal Tasks

### Clean Up the Removed Node

On the removed node (now standalone):

```bash path=null start=null
# Reset cluster configuration
systemctl stop pve-cluster corosync
pmxcfs -l
rm /etc/corosync/*
rm /etc/pve/corosync.conf
rm -rf /etc/pve/nodes/<removed-node-name>

# Restart services
systemctl start pvedaemon
systemctl start pveproxy
```

### Update Monitoring and Backups

- Remove the node from monitoring systems
- Update backup jobs to exclude the removed node
- Update any automation scripts that reference the node

## Troubleshooting Common Issues

### Node Won't Remove ("node still has resources")

If you encounter this error:

```bash path=null start=null
# Force removal (use with caution)
pvecm delnode <node-name> --force

# Or manually clean up resources
pvesh delete /nodes/<node-name>/storage/<storage-id>
```

### Quorum Issues After Removal

If the cluster loses quorum after node removal:

```bash path=null start=null
# Check expected votes
corosync-quorumtool -s

# Adjust expected votes if necessary (emergency only)
corosync-quorumtool -e <new-expected-votes>
```

### Cluster Communication Issues

If remaining nodes can't communicate:

```bash path=null start=null
# Restart cluster services on all remaining nodes
systemctl restart pve-cluster
systemctl restart corosync

# Check cluster ring status
corosync-cfgtool -s
```

## Best Practices

1. **Plan Maintenance Windows**: Schedule node removal during low-activity periods
2. **Document Dependencies**: Keep track of which VMs/containers run on which nodes
3. **Test Migration**: Verify VM migrations work before starting the removal process
4. **Monitor Resources**: Ensure remaining nodes have sufficient resources
5. **Backup Configuration**: Always backup cluster configuration before making changes

## Recovery from Failed Removal

If the removal process fails and you need to re-add the node:

```bash path=null start=null
# From the problematic node, rejoin the cluster
pvecm add <cluster-ip>

# Or completely reset and rejoin
systemctl stop pve-cluster corosync
rm /etc/pve/corosync.conf
rm -rf /etc/pve/nodes/*
pvecm add <cluster-ip>
```

## Cluster: no quorum for login (web interface)

If something has gone bad, you may end with a `no quorum` error on the web interface. In order to fix this you need to complitely remove the cluster configuration and start fresh.

```bash
systemctl stop pve-cluster corosync
pmxcfs -l
rm /etc/corosync/*
rm /etc/pve/corosync.conf
killall pmxcfs
systemctl start pve-cluster
```

## Conclusion

Removing a Proxmox node from a cluster requires careful planning and execution. Always ensure you have migrated all resources, maintain cluster quorum, and have a recovery plan in case something goes wrong. The key to success is preparation and understanding the dependencies between your nodes and resources.

Remember that cluster topology changes affect backup schedules, high availability configurations, and resource allocation across your infrastructure.