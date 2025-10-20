---
title: 'Slideshow in WordPress'
date: Fri, 25 May 2012 09:35:33 +0000
draft: false
tags: ['PHP', 'slideshow', 'wordpress']
disqus_url: http://www.emanueletessore.com/slideshow-wordpress/
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg
---

If you're planning to build a **showcase website with WordPress** you'd probably insert at least in the home page
some **images with a sliding effect**.

By using jQuery make them slide is pretty easy, but I had some trouble to **choose a way to manage the images in the
cms**.

My goal was to **use the fewest number of plugins possible**, because I want something usable on most website I have to
develop.

WordPress put at our disposal a **gallery** tool which is reachable by clicking on the `Add Media` button on top of the
body article.

By using this we have a big pro: **WordPress takes care of re-sizing and cropping the images**.

The con is that by default this system will show **only a list of thumbnails linking to the full-size image**.

Here's an example with `Link thumbnails to: Image File` option and no js to make it open in a modal window.
[gallery link="file"]

To avoid those thumbs and make a real slideshow I used the thumbnail feature of WordPress combined with
[wp_get_attachment_image](http://codex.wordpress.org/Function_Reference/wp_get_attachment_image "WordPress Codex: Function_Reference wp_get_attachment_image")
function.

Here's the code:

```phtml
<?php
function slideshow($images=null){

	if(isset($images)){
		$images = (array)get_children( 'post_type=attachment&post_mime_type=image&post_parent='.get_the_ID() );
	}
	$uid = uniqid('carousel-');
	$tpl = <<< EOF
		<div class="item%active%">
			%img%
			<div class="carousel-caption">
				<h4>%title%</h4>
				%description%
			</div>
		</div>
EOF;
	$prepend = '<div id="'.$uid.'" class="carousel slide">
	<div class="carousel-inner">';
	$append = '</div>
	<a class="carousel-control left" href="#'.$uid.'" data-slide="prev">&lsaquo;</a>
	<a class="carousel-control right" href="#'.$uid.'" data-slide="next">&rsaquo;</a>
	</div>';
	$toret = '';
	$size = 'slideshow-mini';
	$is_first = true;
	foreach($images as $img) {
		$alt = get_post_meta($img->ID, '_wp_attachment_image_alt', true);
		$toret .= str_replace(
				array('%img%','%title%','%description%', '%active%'),
				array(
						wp_get_attachment_image(
								$img->ID,
								$size,
								false,
								array(
										'class'	=> "attachment-$size",
										'alt'   => empty($alt) ? ' ' : trim(esc_attr(strip_tags($alt))),
										'title' => empty($img->post_title) ? '' : trim(esc_attr(strip_tags($img->post_title))),
								)
						),
						get_the_title($img->ID),
						apply_filters('the_content', $img->post_content),
						($is_first) ? ' active' : ''
				),
				$tpl
		);
		$is_first = false;
	}
	return $prepend.$toret.$append;
}
```

Please take note that if you want to have a fixed size for the images you have to add a width and height set to the
thumbnail system of WordPress.

This is explained [here](#force-dimensions).

This is an example of the code above:

[slideshow] (many thanks to Twitter for sharing Bootstap ui :) ) This will produce a markup like this:


```phtml
<div id="carousel-4fbea6cb57c5b" class="carousel slide">

	<div class="carousel-inner">
		<div class="item active">

			<img width="870" height="500"
				src="http://www.emanueletessore.com/wp-content/uploads/2012/05/bootstrap-mdo-sfmoma-03.jpg"
				class="attachment-slideshow-mini"
				alt="Third Thumbnail alternate text" title="Third Thumbnail label" />

			<div class="carousel-caption">

				<h4>Third Thumbnail label</h4>

				<p>Cras justo odio, dapibus ac facilisis in, egestas eget quam.
					Donec id elit non mi porta gravida at eget metus. Nullam id dolor
					id nibh ultricies vehicula ut id elit.</p>

			</div>

		</div>
		<div class="item">

			<!-- second item here -->

		</div>
		<div class="item">

			<!-- third item here -->

		</div>
	</div>

	<a class="carousel-control left" href="#carousel-4fbea6cb57c5b"
		data-slide="prev">&lsaquo;</a> <a class="carousel-control right"
		href="#carousel-4fbea6cb57c5b" data-slide="next">&rsaquo;</a>

</div>
```

## Some improvement we can take care of

### Let the user choose witch images show in the slideshow

If you need to **choose which images put on the slideshow** i suggest to install a plugin that let you assign a semantic
tag to a media element:
[Media Tags](http://www.codehooligans.com/projects/wordpress/media-tags/ "Media Tags WordPress Plugin")
(at this link you can also find the documentation for `get_attachments_by_media_tags` function).

Then you can easily **retrieve only the desired image** by calling:

```phtml
<?php
$images = get_attachments_by_media_tags('media_tags=slideshow');
echo slideshow($images);
```

and pass $images as first parameter to the function showed above. update: I suggest to prepend a '@' to avoid php
warnings if no image can be found.

### Force images dimensions

You can easily avoid image dimension error by adding a new set of width and height to the re-sizing system of WordPress.
This is done with
[add\_image\_size](http://codex.wordpress.org/Function_Reference/add_image_size "WordPress Codex: add_image_size function reference")
function. For Example in my case:

```phtml
<?php
add_theme_support('post-thumbnails');
add_image_size('slideshow-mini', 870, 500, true);
```