---
title: 'Wordpress: Download failed. A valid URL was not provided.'
date: Thu, 16 Jan 2014 15:48:57 +0000
draft: false
tags: ['PHP', 'wordpress']
disqus_url: http://www.emanueletessore.com/wordpress-download-failed-valid-url-provided/
---

Some days ago I've updated my **WordPress** to the new 3.8 version. 

For storing my themes and plugins I've set up a **repository** on a virtual machine running on the **same virtual network**. 

This was working perfectly until WordPress 3.5, but since 3.6 the developers added a new security feature that denies access to repository with a local ip, for example 172.[16-31].x.x as in my case, but also 127.0.0.1, 10.x.x.x, 192.168.x.x. 

When I try to install or update a theme or plugin I've got this error:

```
Downloading install package from http://put.your-repository-domain-here.co/my/path/to/my/download
**Download failed. A valid URL was not provided.**
```

To **add your repository to the allowed list** you can simply add these lines to the very end of your wp-config.php. 

```phtml
<?php 

/** Enable my local themes and plugins repository FFS!!! */
add_filter( 'http_request_host_is_external', 'allow_my_custom_host', 10, 3 );
function allow_my_custom_host( $allow, $host, $url ) {
  if ( $host == 'put.your-repository-domain-here.com' )
    $allow = true;
  return $allow;
}
```

*   Be advise that the php open tag may not be required.
*   Check also that the given code is placed after: `require_once(ABSPATH . 'wp-settings.php');`
*   Don't mind the warning: `/* That's all, stop editing! Happy blogging. */`