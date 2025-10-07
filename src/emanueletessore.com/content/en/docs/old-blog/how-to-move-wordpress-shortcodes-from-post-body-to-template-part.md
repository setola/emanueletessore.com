---
title: 'How To move WordPress shortcodes from post body to template part'
date: Mon, 23 Feb 2015 15:07:09 +0000
draft: false
tags: ['PHP']
---

**Shortcodes** are a very fancy feature of **WordPress** CMS.

They basically let the developer manage some stuff programmatically and let the blogger decide which information display
and where to put it according the article body.

But sometime you need the blogger to be able to decide what kind of information display, and the developer have to put
them in the right place.

For example in my case I had to show first a brief introduction text and then a list of special sales.

Here's the code:

```phtml
<?php 
// First we remove all the shortcodes from the post body
add_action('the_content', 'strip_shortcodes');

get_template_part('header');
?>

    <div id="main-container" class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <?php get_template_part('content'); ?>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <?php
                // Now we take only the shortcodes from the post body and print their output here, in a separate DOM element
                global $post;
                $pattern = get_shortcode_regex();
                preg_match_all('/'.$pattern.'/s', $post->post_content, $matches);
                if(is_array($matches[0])){
                    foreach($matches[0] as $shortcode){
                        echo do_shortcode($shortcode);
                    }
                }
                ?>
            </div>
        </div>
    </div>

<?php get_template_part('footer'); ?>
```

This way I've also fixed some issues with wpautop: in fact sometime such method will insert an empty paragraph into the
html when using shortcodes.