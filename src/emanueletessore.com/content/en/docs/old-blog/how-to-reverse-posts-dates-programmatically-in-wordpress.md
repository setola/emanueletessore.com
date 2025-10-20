---
title: 'How to reverse posts dates programmatically in WordPress'
date: Fri, 20 Feb 2015 15:32:06 +0000
draft: false
tags: ['PHP', 'wordpress']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg
---

Some days ago the phone rang and the client asked me why their WordPress blog posts where showing in the inverted order.

Well my answer was something like 'you just entered them in the reverse order so this is perfectly normal'.

And then tears were shed through the phone itself.

Since I can't swim, I decided to fix the **wrong posts order** without asking the client to manually change all the
dates.

Here' how I **programmatically reverse the posts dates in WordPress**:

```phtml
<?php
$articles = get_posts(array(
  'post_type'         =>  MY_CUSTOM_POST_TYPE,
  'numberposts'    =>  -1
));

$date = array();

foreach($articles as $art){
  $date[] = array($art->post_date_gmt, $art->post_date);
}

$date_r = array_reverse($date);

foreach($articles as $k => $art){
  //echo 'from: '.$art->post_date.' to: '.$date_r[$k][1].'<br>'; // just to be shure
  $art->post_date = $date_r[$k][1];
  $art->post_date_gmt = $date_r[$k][0];
  //wp_update_post($art); // enable this when you're sure :)
}
```

You need to call this code only once... you can choose to call it from the CLI, or from a 'secret' page in your
WordPress website.

Remember to:

1. change the MY\_CUSTOM\_POST\_TYPE constant to your post type: 'post' is the default type for posts (you don't say?)
2. uncomment the wp\_update\_post() if you're happy with the date substitution.

I know this code is ugly... but honestly... It works, I don't care. Cheers!