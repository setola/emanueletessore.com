---
title: 'Slideshow: one big image for all'
date: Sat, 05 May 2012 19:07:27 +0000
draft: false
tags: ['gd libs', 'PHP', 'slideshow', 'website optimization']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg
---

Most of the websites I've set up **weight** is given by the images of the **slideshow**.

Here's a simple PHP function that can be usefull to **reduce both weight and number of connection** for this element.

The concept behind this function is pretty simple:

1. take an array of images (jpg/png/gif)
2. **merge them in a unique big jpeg image**
3. return the url to this one.
4. using css **sprite tecnique**, set this big image as the background of every <div> of the slideshow with a different
   background-position.

Here's the code:

```phtml
<?php

function merge_images($images, $config=null){
	if(empty($images)) return 'No images';
	$config = array_merge(
			array(
					'w'		=>	'700',
					'h'		=>	'370',
					'q'		=>	'50',
					'r'		=>	false
			),
			$config
	);

	$combined_image = imagecreatetruecolor($config['w']*count($images), $config['h']);

	$cache_name = '';
	foreach($images as $image){
		$cache_name .= $image['path'].';';
	}
	$cache_name .= serialize($config);
	$cache_name = md5($cache_name);

	$cache_dir = get_template_directory().'/cache/';
	if (!@is_dir($cache_dir)){
		if (!@mkdir($cache_dir)){
			die('Couldn\'t create cache dir: '.$cache_dir);
		}
	}
	$cache_url = get_bloginfo('template_url').'/cache/'.$cache_name.'.jpg';
	$cache_path = $cache_dir.$cache_name.'.jpg';

	if(!file_exists($cache_path) || IMAGE_MERGE_FORCE_REFRESH===true){
		foreach($images as $array_index => $image){
			$src = $image['url'].'?'.http_build_query($config, '', '&');

			$info = getimagesize($src);
			switch($info['mime']){
				case 'image/jpeg':
					$image = imagecreatefromjpeg($src);
					break;
				case 'image/png':
					$image = imagecreatefrompng($src);
					break;
				case 'image/gif':
					$image = imagecreatefromgif($src);
					break;
				default:
					die('unknow mime type');
			}
				
			imagecopymerge(
					$combined_image,
					$image,
					$array_index*$config['w'],
					0, 0, 0,
					$config['w'],
					$config['h'],
					100
			);

			imagejpeg(
					$combined_image,
					$cache_path,
					$config['q']
			);
		}
	}

	return $cache_url;
}
```

The second parameter $config is optional array of width, height, quality, and resample; if not passed the default values
are 800x600, 50% and 'do not resample' built to support all the parameter used by timthumb.

**Using it** is not a big deal:

1. retrieve the image list from your CMS
2. pass it to this function as first parameter
3. print some div with in-line style setting the image url as background and position (wich is always
   number_of_the_image * width)

Here's an example: 

```phtml
<?php 
	$width = 1900;
	$height = 500;
	$config = array(
		'w'=>$width,
		'h'=>$height,
		'q'=>'50'
	);
	define('IMAGE_MERGE_FORCE_REFRESH', false);
	$images = wp_get_imagelist_for_slideshow(
		'current',
		array(
			'default'=>'',
			'field'=>'caption'
		),
		$config
	);
	$merged_image_uri = merge_images($images, $config);
	
	//vd($images);
	
	$tpl = '
		<div 
			class="slideshow_image"
			title="%title%"
			style="background:url(\''.
			$merged_image_uri.
			'\') no-repeat scroll -%opos%px -%vpos%px transparent;width:'.
			$width.
			'px;height:'.
			$height.
			'px;%style%"
		>
			<div class="black_grad z_6"></div>
			<div class="caption_container z_10">
				<div class="container_16 z_10">
					<div class="grid_16 text_right color_fff font_30 font_palatino">%caption%</div>
				</div>
			</div>
		</div>
	';
	
	foreach ($images as $array_index => $image){
		//printf($tpl, $array_index * $width, 0);
		echo str_replace(
			array(
				'%caption%',
				'%opos%',
				'%vpos%',
				'%title%',
				'%style%'
			),
			array(
				$image['caption'],
				$array_index * $width,
				'0',
				$image['title'],
				($array_index == 0) ? '' : 'display:none'
			),
			$tpl
		);
	}
```

Using this method will give us some benefits:

* if someone uploads an **image with wrong dimension**, this **will be re-sized** and it will not brake the layout
* **you will never serve a too heavy image**, because this function can force it to have fixed jpeg quality; for example
  60%
* for an averange of 5 images per slideshow we have **only one concurrent http connection**
* the total weight of the page is significantly decreased: on 'aipini.it' I was able to reduce from ~900K (~200k per
  image per 4 images) to an unique big image of ~400k

Limitation: it cannot be applied to a dynamically sized slideshow: for example a full screen images or an adaptive
design: image size have to be know.