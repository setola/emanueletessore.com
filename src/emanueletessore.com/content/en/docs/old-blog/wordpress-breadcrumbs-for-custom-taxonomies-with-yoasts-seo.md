---
title: 'WordPress: breadcrumbs for custom taxonomies with Yoast''s SEO'
date: Tue, 12 Jun 2012 10:20:30 +0000
draft: false
tags: ['breadcrumbs', 'PHP', 'wordpress', 'YOAST seo plugin']
disqus_url: http://www.emanueletessore.com/wordpress-breadcrumbs-for-custom-taxonomies-with-yoasts-seo/
---

[**WordPress SEO**](http://yoast.com/wordpress/seo/ "WordPress SEO Plugin Homepage") is a very good plugin developed by **Yoast**. 

It has a ton of interesting features including a nice and easy to use '**Breadcrumb**'. 

It works like a charm until you have to integrate a custom taxonomy in a page: for example I had to insert a Portfolio section managed by [BWS Porfolio Pugin](http://bestwebsoft.com/plugin/portfolio-plugin/ "BWS Portfolio plugin") in normal page. 

In my case (this site, portfolio section) i have a custom taxonomy for the portfolio in witch every post is a project I've developed. 

Then the page 'Portfolio' retrieves the last entries and prints it like a normal blog homepage. 

This is managed by **BWS Portfolio plugin**. 

The issue is that for WordPress the taxonomy is not child of the page; 
this cause the single article to be son of post 0 (the homepage). 

This is not logically correct for me. 

So I want to insert an entry between the article and the homepage. 

This is the code to do it: 

```phtml
<?php	
	/**
	 * Trick to have the 'Portfolio' entry into the breadcrumbs
	 */
	global $portfolio_id; 
	$portfolio_id = 165;
	add_filter('wp_seo_get_bc_ancestors', 'add_portfolio_taxonomy', 10, 1);
	function add_portfolio_taxonomy($ancestors){
		global $portfolio_id;
		$ancestors[] = $portfolio_id;
		return $ancestors;
	}
	global $wp_query, $post;
	the_post();
	$post->post_parent = $portfolio_id;
```

and have to be placed in the template file used by the portfolio page and by the single portfolio item. 

If you plan to put it in functions.php you'll have to insert some conditional to add the desired ancestor only when needed. 

The trick it's quite simple: we have to cheat on `$post->post_parent` so that the Yoast's code will assume the current article is child of the page 'Portfolio'. 

This is done by adding a filter called `wp_seo_get_bc_ancestors`. 

I know this is a workaround, maybe someday Yoast will implement something better to solve this little issue. 

For now this piece of code make **WordPress SEO Breadcrumbs and BWS Portfolio work together**.