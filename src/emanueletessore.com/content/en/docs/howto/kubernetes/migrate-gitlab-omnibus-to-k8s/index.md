---
title: "Migrating GitLab Omnibus to Kubernetes with GitLab Operator"
date: 2025-10-20T10:00:00Z
draft: false
tags: ['GitLab', 'Kubernetes', 'Migration', 'Operator']
categories: ['howto', 'Kubernetes']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gitlab/gitlab-original.svg
---

## Overview

This guide outlines the process to migrate an existing GitLab installation using the Omnibus package to a Kubernetes cluster managed by the GitLab Operator. Note that GitLab Operator does not support direct migration from Omnibus or Helm chart installations. Instead, you must perform a backup and restore operation.

The migration leverages GitLab's backup and restore functionality, which is compatible between different deployment methods.

## Prerequisites

- A running GitLab Omnibus installation.
- A Kubernetes cluster with GitLab Operator installed.
- Access to object storage (recommended for production).
- Sufficient storage space for backups.
- Same GitLab version on both source and target.

## Migration Steps

### 1. Prepare the Omnibus Installation

Ensure your GitLab instance is healthy:

```bash
sudo gitlab-ctl status
```

Verify repository integrity:

```bash
sudo gitlab-rake gitlab:git:fsck
```

### 2. Migrate Data to Object Storage (Optional but Recommended)

For production deployments, migrate uploads, artifacts, and other data to external object storage to avoid storing large amounts of data in the backup.

Follow the [object storage migration guide](https://docs.gitlab.com/administration/object_storage/#migrate-to-object-storage).

### 3. Create a Backup

Create a backup of your Omnibus installation, excluding directories already migrated to object storage:

```bash
sudo gitlab-backup create EXCLUDE=artifacts,uploads,lfs,pages,registry
```

The backup file will be stored in `/var/opt/gitlab/backups/` by default.

### 4. Deploy GitLab Operator

Install GitLab Operator on your Kubernetes cluster following the [installation documentation](https://docs.gitlab.com/operator/installation/).

Create a GitLab custom resource with appropriate configuration for your environment.

### 5. Restore the Backup

Use the Toolbox pod to restore the backup to your Operator-managed GitLab instance.

First, copy the backup file to a location accessible by the Toolbox pod, then run:

```bash
kubectl exec -it <toolbox-pod-name> -- /bin/bash
gitlab-backup restore BACKUP=<backup-filename>
```

### 6. Migrate Secrets

Copy secrets from `/etc/gitlab/gitlab-secrets.json` on the Omnibus server to your GitLab custom resource configuration.

### 7. Restart Pods

Restart all GitLab pods to apply changes:

```bash
kubectl delete pods -l app.kubernetes.io/instance=<gitlab-instance-name>
```

### 8. Verify the Migration

- Access the GitLab UI and verify users, groups, projects, and issues are present.
- Check that uploaded files and avatars load correctly.
- Test repository access and CI/CD pipelines.

## Troubleshooting

- If restore fails, check the Toolbox pod logs.
- Ensure network connectivity between the backup location and Kubernetes cluster.
- For large backups, consider using persistent volumes or cloud storage.

## Resources

- [GitLab Operator Documentation](https://docs.gitlab.com/operator/)
- [Backup and Restore Overview](https://docs.gitlab.com/administration/backup_restore/)
- [Migrate from Linux Package to Helm Chart](https://docs.gitlab.com/charts/installation/migration/package_to_helm/)