---
title: 'WordPress multisite: My Sites menu in the admin bar shows the same blog after updating to 3.5.1'
date: Wed, 06 Feb 2013 16:58:33 +0000
draft: false
tags: ['PHP', 'w3 total cache', 'wordpress']
disqus_url: http://www.emanueletessore.com/wordpress-multisite-my-sites-menu-in-the-admin-bar-shows-the-same-blog-after-updating-to-3-5-1/
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg
---

Today I've noticed a little bug come out on my **WordPress network** running on a **Wordpress Multisite** configuration.

In the `admin bar` the `My Sites` menu **was showing the currently viewing blog** a number of times.

Further looking revealed me that for **every blog on the network** that link was **pointing to the current blog**.

My first thought was 'something went wrong while **updating WordPress to 3.5.1**'.

But I was wrong. The cause of this bug was **W3 Total Cache plugin**.

To restore the functionality of the My Sites menu i simply `network activated` W3TC and then **network deactived**.

And the bug was gone!