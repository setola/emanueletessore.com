---
title: How to Reorder Magento 2 Attribute Options Alphabetically
date: Sat, 29 Aug 2025 19:12:34 +0000
draft: false
featured_image: "/images/logos/magento-2.png"
tags: ['Magento', 'MySQL']
categories: ['Howto', 'Magento']
---

Sometimes in Magento 2 you end up with attribute options (like dropdown values) that are not ordered the way you want. 

The good news: you can reorder them alphabetically with a simple SQL query.

This guide shows you how to do it safely, step by step.

## Check your table prefix

Magento tables usually have a prefix. In our case it’s `ps`.
That means tables are named like `ps_eav_attribute_option` instead of `eav_attribute_option`.

You can check what prefix your installation uses by looking at your `app/etc/env.php`:

```bash
cat app/etc/env.php | grep 'table_prefix'
```

Example snippet from `env.php`:

```bash
'db' => [
    ...
    'table_prefix' => 'ps',
    ...
],
```

If your `table_prefix` is empty, then your tables won’t have any prefix at all.

> **Note:** remember to change tables name accordingly to your own `table_prefix` value in every query below.

## Find the `attribute_id` of your attribute

In this example we’re working with `attribute_id = 83`, but you’ll need to find the ID for your attribute.

You can get it directly from the database:

```sql
SELECT attribute_id, attribute_code, frontend_label
FROM ps_eav_attribute
WHERE attribute_code = 'your_attribute_code';
```

Replace `your_attribute_code` with the actual attribute code (for example `manufacturer`, `color`, etc.).
The `attribute_id` you get here is the one you’ll use in the query.

## Preview the new sort order

Before running any UPDATE, preview the result. This query will show you how your options will be sorted alphabetically and what the new incremental `sort_order` values will be:

```sql
SET @rownum := 0;

SELECT 
    x.option_id,
    x.option_value,
    @rownum := @rownum + 1 AS new_sort_order,
    x.current_sort_order
FROM (
    SELECT 
        o.option_id,
        v.value AS option_value,
        o.sort_order AS current_sort_order
    FROM ps_eav_attribute_option AS o
    JOIN ps_eav_attribute_option_value AS v
      ON v.option_id = o.option_id
    WHERE o.attribute_id = 83
    ORDER BY v.value ASC
) AS x;

```

Output columns explained:
* `option_id` → the option’s unique ID
* `option_value` → the label of the option
* `new_sort_order` → what the new order would be
* `current_sort_order` → the current order in the DB

## Backup before updating (important!)

⚠️ Always back up the tables before you make changes.

At minimum, back up these two:
* ps_eav_attribute_option
* ps_eav_attribute_option_value

Quick backup command:
```bash
mysqldump -u USER -p DBNAME ps_eav_attribute_option ps_eav_attribute_option_value > backup_eav_options.sql
```

If anything goes wrong, you can restore them with:

```bash
mysql -u USER -p DBNAME < backup_eav_options.sql
```

## Run the update query

Once you’re sure, here’s the update that will reorder the options alphabetically and set their `sort_order` incrementally:

```sql
SET @rownum := 0;

UPDATE ps_eav_attribute_option AS o
JOIN (
    SELECT 
        x.option_id,
        @rownum := @rownum + 1 AS new_sort_order
    FROM (
        SELECT 
            o.option_id
        FROM ps_eav_attribute_option AS o
        JOIN ps_eav_attribute_option_value AS v
          ON v.option_id = o.option_id
        WHERE o.attribute_id = 83
        ORDER BY v.value ASC
    ) AS x
) AS sorted
ON o.option_id = sorted.option_id
SET o.sort_order = sorted.new_sort_order;
```

👉 By default this starts numbering from 1.
If you want to start from 0, just initialize the variable like this:
```sql
SET @rownum := -1;
```

## Done 🎉

After running the update, your attribute options will now appear alphabetically in the Magento admin dropdowns and on the frontend wherever that attribute is used.