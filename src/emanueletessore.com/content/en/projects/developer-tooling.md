---
title: Developer Tooling & Automation
description: Reusable Taskfiles and a webhook CLI for everyday operations and deployment workflows.
weight: 100
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg
tags: [Automation, Taskfile, Bun]
---

**Type:** Public tooling projects

## Context

Small tools can remove repetitive steps from development and operations without requiring a large platform. These two repositories address recurring command-line and deployment tasks.

## Task Files

A collection of reusable Taskfiles for Docker, Docker Compose, operating-system tasks, SSL and Git. Tasks can be included from a local checkout or through Task's remote Taskfile feature.

The focus is on keeping common procedures in reusable, versioned definitions instead of repeating commands across projects.

[Browse Task Files on GitHub](https://github.com/setola/task-files).

## Hooker

A TypeScript command-line tool built with Bun for calling webhooks inside deployment pipelines. It supports adding, listing and deleting configured hooks, loading a JSON configuration and calling the configured URLs.

The focus is on making webhook calls a repeatable command-line step in a delivery workflow.

[Browse Hooker on GitHub](https://github.com/setola/hooker).
