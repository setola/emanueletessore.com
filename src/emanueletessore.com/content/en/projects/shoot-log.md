---
title: Shoot Log
description: A privacy-first, local-first PWA for sport shooting records, match analysis and training logs.
weight: 50
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg
tags: [React, TypeScript, Local-first]
---

**Type:** Personal project  
**Status:** Work in progress

## Context

Bring sport shooting records, match results and training information into a browser-based application that keeps the user's data locally, without an app-owned backend database.

## Implementation

- React and TypeScript application built with Vite.
- Local storage in IndexedDB through Dexie, with PWA support.
- Match-result imports from PractiScore CAB and Mare2 FITDS PDF files.
- Match analysis, competitor comparisons and in-match scorecard notes.
- Optional backup and synchronization using the user's own Google Drive app data folder.
- Multilingual interface and shareable routes for application sections.

A separate static catalog provides prepared public Mare2 match data. Imported records are stored in the user's browser and optionally included in their own Drive backup.

## Engineering focus

Exploring how a domain-specific application can offer useful analysis and data portability while keeping personal records under the user's control.

[Browse the source code and setup instructions on GitHub](https://github.com/setola/shoot-log).
