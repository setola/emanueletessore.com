---
title: 'Bootstrap Navbar under Wordpress'
date: Sun, 23 Sep 2012 09:46:45 +0000
draft: false
tags: ['PHP', 'twitter bootstrap', 'wordpress']
disqus_url: http://www.emanueletessore.com/bootstrap-navbar-under-wordpress/
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg
---

If you're fallen in love with **Twitter Bootstrap** and **WordPress** as I am, you'll probably need to **develop a theme
with both of them** and one of the first issue you will find is **to have
the [navbar](http://twitter.github.com/bootstrap/components.html#navbar "Twitter Bootstrap - Navbar Section") integrated
with the wordpress menu managing system**.

There was a nice and
candy [walker](http://codex.wordpress.org/Function_Reference/wp_nav_menu#Using_a_Custom_Walker_Function "Wordpress Codex - using navigation menu walkers")
, written by [johnmegahan](https://gist.github.com/1597994) that makes the hard job done in like 2 minutes of
googleing :) Thank you John!

The limit was that it **only support a double level menu**. This means you can only make a
dropdown, wich in BootStrap is not an anchor to a real page but only a toggler element for the openclose popup, with a
list of one level. Well to expand it is really simple: I've make a gist for it:

```php
<?php

/**
 * Extended Walker class for use with the
 * Twitter Bootstrap toolkit Dropdown menus in Wordpress.
 * Edited to support n-levels submenu.
 * @author johnmegahan https://gist.github.com/1597994, Emanuele 'Tex' Tessore https://gist.github.com/3765640
 * @license CC BY 4.0 https://creativecommons.org/licenses/by/4.0/
 */
class BootstrapNavMenuWalker extends Walker_Nav_Menu {


	function start_lvl( &$output, $depth ) {

		$indent = str_repeat( "\t", $depth );
		$submenu = ($depth > 0) ? ' sub-menu' : '';
		$output	   .= "\n$indent<ul class=\"dropdown-menu$submenu depth_$depth\">\n";

	}

	function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {


		$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

		$li_attributes = '';
		$class_names = $value = '';

		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		
		// managing divider: add divider class to an element to get a divider before it.
		$divider_class_position = array_search('divider', $classes);
		if($divider_class_position !== false){
			$output .= "<li class=\"divider\"></li>\n";
			unset($classes[$divider_class_position]);
		}
		
		$classes[] = ($args->has_children) ? 'dropdown' : '';
		$classes[] = ($item->current || $item->current_item_ancestor) ? 'active' : '';
		$classes[] = 'menu-item-' . $item->ID;
		if($depth && $args->has_children){
			$classes[] = 'dropdown-submenu';
		}


		$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
		$class_names = ' class="' . esc_attr( $class_names ) . '"';

		$id = apply_filters( 'nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args );
		$id = strlen( $id ) ? ' id="' . esc_attr( $id ) . '"' : '';

		$output .= $indent . '<li' . $id . $value . $class_names . $li_attributes . '>';

		$attributes  = ! empty( $item->attr_title ) ? ' title="'  . esc_attr( $item->attr_title ) .'"' : '';
		$attributes .= ! empty( $item->target )     ? ' target="' . esc_attr( $item->target     ) .'"' : '';
		$attributes .= ! empty( $item->xfn )        ? ' rel="'    . esc_attr( $item->xfn        ) .'"' : '';
		$attributes .= ! empty( $item->url )        ? ' href="'   . esc_attr( $item->url        ) .'"' : '';
		$attributes .= ($args->has_children) 	    ? ' class="dropdown-toggle" data-toggle="dropdown"' : '';

		$item_output = $args->before;
		$item_output .= '<a'. $attributes .'>';
		$item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
		$item_output .= ($depth == 0 && $args->has_children) ? ' <b class="caret"></b></a>' : '</a>';
		$item_output .= $args->after;


		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
	}
	

	function display_element( $element, &$children_elements, $max_depth, $depth=0, $args, &$output ) {
		//v($element);
		if ( !$element )
			return;

		$id_field = $this->db_fields['id'];

		//display this element
		if ( is_array( $args[0] ) )
			$args[0]['has_children'] = ! empty( $children_elements[$element->$id_field] );
		else if ( is_object( $args[0] ) )
			$args[0]->has_children = ! empty( $children_elements[$element->$id_field] );
		$cb_args = array_merge( array(&$output, $element, $depth), $args);
		call_user_func_array(array(&$this, 'start_el'), $cb_args);

		$id = $element->$id_field;

		// descend only when the depth is right and there are childrens for this element
		if ( ($max_depth == 0 || $max_depth > $depth+1 ) && isset( $children_elements[$id]) ) {

			foreach( $children_elements[ $id ] as $child ){

				if ( !isset($newlevel) ) {
					$newlevel = true;
					//start the child delimiter
					$cb_args = array_merge( array(&$output, $depth), $args);
					call_user_func_array(array(&$this, 'start_lvl'), $cb_args);
				}
				$this->display_element( $child, $children_elements, $max_depth, $depth + 1, $args, $output );
			}
			unset( $children_elements[ $id ] );
		}

		if ( isset($newlevel) && $newlevel ){
			//end the child delimiter
			$cb_args = array_merge( array(&$output, $depth), $args);
			call_user_func_array(array(&$this, 'end_lvl'), $cb_args);
		}

		//end this element
		$cb_args = array_merge( array(&$output, $element, $depth), $args);
		call_user_func_array(array(&$this, 'end_el'), $cb_args);

	}

}
```

Simply copy and paste it at the end of
your [functions.php](http://codex.wordpress.org/Functions_File_Explained "Wordpress Codex - functions.php explained") As
I was coding something interesting I've also added **support for horizontal dividers element**: a nice separator between
two entries. To have it simply add the class '_divider_' into the optional css classes field in the element of the
wordpress menu. The line will be printed **before the element** you gave the class. Once registered the navbar
with [register\_nav\_menu](http://codex.wordpress.org/Function_Reference/register_nav_menu "Wordpress Codex - register_nav_menu function")
in functions.php

```php
register_nav_menu('top-bar', __('Primary Menu'));
```

This is how to print the navigation bar:

```phtml
<div class="navbar navbar-fixed-top">
	<div class="navbar-inner">
		<div class="container">
			<?php
				
				$args = array(
					'theme_location' => 'top-bar',
					'depth'		 => 0,
					'container'	 => false,
					'menu_class'	 => 'nav',
					'walker'	 => new BootstrapNavMenuWalker()
				);

				wp_nav_menu($args);
			
			?>
		</div>
	</div>
</div>
```

This piece of code (I hope) is re-usable on
every WordPress theme; it will be included in my list of everywhere present classes. That's all folks, let bootstrap
fill your heart :) Update: If you like to have the **bootstrap navbar dropdown menu open on mouse over**, simply use
this JavaScript code somewhere after jQuery.js and bootstrap.js

```javascript
/**
 * This code changes the default behavior of the navbar:
 * now the submenu pops in when the user rolls his mouse
 * over the parent level menu entry.
 * Many tanks to Hanzi for this idea and code!
 */
jQuery(document).ready(function($) {
  $('ul.nav li.dropdown, ul.nav li.dropdown-submenu').hover(function() {
		$(this).find(' > .dropdown-menu').stop(true, true).delay(200).fadeIn();
	}, function() {
		$(this).find(' > .dropdown-menu').stop(true, true).delay(200).fadeOut();
	});
});
```