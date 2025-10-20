---
title: 'How to use multiple passwords to access a protected WordPress post'
date: Fri, 20 Feb 2015 16:24:52 +0000
draft: false
tags: ['News']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg
---

Everyone should know that in the WordPress admin interface you can set a **single password** to make a post visible only
to the people who knows such password.

But what if you need a **more permissive set of rules** to show the post content?

For example, you want to show a **promotional code** for your shop only to the **owners of a specific card**.

The card has an ID on it and every ID is made of two letters plus 9 numbers.

Here's my solution:

```phtml
<?php
/*
Template Name: Custom Password
*/


/**
 * Checks if the given code has a valid format ex: AB123456789
 * @param $code string the code
 * @return bool true only if code is valid
 */
function checkCode($code){
    if(is_null($code)) return false;
    if(empty($code)) return false;
    if(strlen($code)!=11) return false;
    if(!is_numeric(substr($code,2,9))) return false;
    if(!ctype_alpha(substr($code,0,2))) return false;
    return true;
}

/**
 * Checks if the we can display the post content
 * @return bool
 */
function can_view_content(){
    if(isset($_POST['post_password']) && checkCode($_POST['post_password'])) return true;

    require_once ABSPATH . 'wp-includes/class-phpass.php';
    $hasher = new PasswordHash( 8, true );

    $hash = ( $_COOKIE[ 'wp-postpass_' . COOKIEHASH ] );

    if ( 0 !== strpos( $hash, '$P$B' ) )
        return false;

    return $hasher->CheckPassword( 'yesyoucan', $hash );
}





if(isset($_POST['post_password'])){
    require_once ABSPATH . 'wp-includes/class-phpass.php';
    $hasher = new PasswordHash( 8, true );
    $expire = apply_filters( 'post_password_expires', time() + 10 * DAY_IN_SECONDS );
    $pass = checkCode($_POST['post_password']) ? 'yesyoucan' : 'noyoucant';
    setcookie( 'wp-postpass_' . COOKIEHASH, $hasher->HashPassword( ( $pass ) ), $expire, COOKIEPATH );
}



get_template_part('header');
?>

    <div id="main-container" class="container">
        <div class="row">
            <div class="main-content col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

                    <div id="title-container" class="clearfix">
                        <header class="header">
                            <h1 class="title"><?php the_title(); ?></h1>
                        </header>
                    </div>

                    <div class="content">
                        <?php
                            if(can_view_content()) {
                                the_content(__('Continue reading <span class="meta-nav">&rarr;</span>', BLU_THEME_TEXTDOMAIN));
                            } else {
                                global $input_with_label,
                                       $form_submit_button;

                                $input_with_label
                                    ->set_markup('pre', '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">')
                                    ->set_markup('post', '</div>')
                                    ->set_markup('label-class', 'col-sm-4 control-label')
                                    ->set_markup('input-wrapper-class', 'col-sm-8')
                                    ->set_markup('id', 'post-protected-' . get_the_ID())
                                    ->set_markup('name', 'post_password')
                                    ->set_markup('type', 'password')
                                    ->set_markup('help', __("To view this protected content, enter your card number:"))
                                    ->set_markup('label', __('ACI Card ID', BLU_FORMS_TEXTDOMAIN))
                                    ->set_markup('placeholder', __('Your ACI card ID', BLU_FORMS_TEXTDOMAIN));

                                echo HtmlHelper::standard_tag(
                                    'form',
                                    $input_with_label->replace_markup()
                                    . $form_submit_button
                                        ->set_markup('label', __('Submit your request', BLU_FORMS_TEXTDOMAIN))
                                        ->replace_markup(),
                                    array(
                                        'id' => 'form-requestquote',
                                        'data-form-name' => 'requestquote',
                                        'class' => 'blu-form form-horizontal',
                                        'method' => 'post',
                                        'action' => ''
                                    )
                                );
                            }
                        ?>
                    </div>
                </article>
            </div>
        </div>
    </div>

<?php get_template_part('footer');
```

This solution stores an hashed fake password (yesyoucan) in a cookie so that the first time you enter your card ID, it
will be remember for 10 days.