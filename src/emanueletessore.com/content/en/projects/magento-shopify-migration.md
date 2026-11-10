---
title: Magento to Shopify Migration Suite
description: Node.js tooling for migrating Magento 2 product and customer exports into Shopify through its GraphQL Admin API.
weight: 60
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/magento/magento-original.svg
tags: [Node.js, Shopify, Data Migration]
---

**Type:** Public tooling project

## Context

Moving an online store involves more than copying rows: product variants, images, inventory, customer addresses and data formats must be mapped between platforms.

## Implementation

- Separate migration tools for products and customers, based on Magento 2 CSV exports.
- Shopify GraphQL Admin API integration with shared client and data-normalization utilities.
- Support for product variants, images, inventory and SEO fields.
- Customer migration including addresses, phone numbers and marketing consent.
- Batch processing, logging and API rate-limit handling.
- CSV inspection and filtering utilities to help prepare migration data.
- Docker-based execution for a consistent runtime.

## Engineering focus

Making data preparation, migration execution and troubleshooting explicit parts of an e-commerce integration workflow.

[Browse the source code and migration documentation on GitHub](https://github.com/setola/magento-csv-to-shopify).
