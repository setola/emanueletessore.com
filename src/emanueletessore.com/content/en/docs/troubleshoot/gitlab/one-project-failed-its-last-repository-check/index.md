---
title: "GitLab One project failed its last repository check."
date: 2022-08-08T09:25:33Z
draft: false
tags: ['Gitlab']
categories: ['Troubleshoot', 'Arduino']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gitlab/gitlab-original.svg
---

reference: https://forum.gitlab.com/t/gitlab-projects-failed-their-last-repository-check/19147/3

find all repositories that failed: link in mail)
http://gitlab.rblab.it/admin/projects?last_repository_check_failed=1

(OPTIONAL) Check `/var/log/gitlab/gitlab-rails/repocheck.log` for additional info,

open specific project `Menu`->`Admin`->`Projects`->`<the failed project>`
and search for `Gitaly relative path`

something like this: `@hashed/48/b3/48b361d46638bfa4eee090c158a750a69c7beec3a62e703e2801125551b1b157.git`

ssh into gitlab vm and save the path into a variable for easiness of access:

  ```bash
  export hashed_path="<paste_here_the_hashed_path>"
  ```

then check git cache

  ```bash
  sudo -u git /opt/gitlab/embedded/bin/git -C "/var/opt/gitlab/git-data/repositories/${hashed_path}" fsck
  ```

and check if there are any errors like

  ```
  error: Could not read 098b53ffbe581e25b…
  failed to parse commit 098b53ffbe581e25b… from object database for commit-graph
  ```

now run garbage collector gc with

```bash
sudo -u git /opt/gitlab/embedded/bin/git -C "/var/opt/gitlab/git-data/repositories/${hashed_path}" gc
```

and check again repository with fsck

```bash
sudo -u git /opt/gitlab/embedded/bin/git -C "/var/opt/gitlab/git-data/repositories/${hashed_path}" fsck
```

and errors and fails should be cleared

run again `Trigger repository check` in check if repository check has passed successfully.

If it was successful then this repository shouldn’t be in repository list that have failed to pass the repository
check: http://gitlab.rblab.it/admin/projects?last_repository_check_failed=1
