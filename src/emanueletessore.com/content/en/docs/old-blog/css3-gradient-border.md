---
title: 'CSS3 gradient border'
date: Thu, 14 Jun 2012 09:32:40 +0000
draft: false
tags: ['CSS &amp; Html', 'css3 gradient']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg
---

Some days ago my preferred graphic designer come out with a strange **call-to-action button style**. It was a **rounded
corner rectangle** with a nice purple **gradient as background** and the **reverse gradient was used for the border**.
It was something like this:

![Call To Action button with gradient border](/old-blog/css3-gradient-border/test-cta-gradients-raster.png "Call To Action button with gradient border")

The effect is really impressive for visibility, but I had no idea how to make a **gradient border in css3**. This time
Fireworks helped me because with this nice program by Adobe you can draw a single rounded rectangle with gradient
background and then a smaller one with reverse gradient inside the first one.

Here's a [Fireworks PNG](/old-blog/css3-gradient-border/test-cta-gradients.png). This concept is can be
easily transposed in html+css by wrapping the call to action element in a container.

Then you only have to assign the container some pixel of padding and the job is done. The code is really simple:

```html

<style>
    .inner, .wrapper:hover {
        background: #e2017b;
        background: -moz-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #e2017b), color-stop(100%, #640037));
        background: -webkit-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: -o-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: -ms-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: linear-gradient(top, #e2017b 0%, #640037 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#e2017b', endColorstr='#640037', GradientType=0);
    }

    .wrapper, .inner:hover {
        background: #640037;
        background: -moz-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #640037), color-stop(100%, #e2017b));
        background: -webkit-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: -o-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: -ms-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: linear-gradient(top, #640037 0%, #e2017b 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#640037', endColorstr='#e2017b', GradientType=0);
    }

    .wrapper {
        width: 100px;
        height: 30px;
        line-height: 30px;
        color: #fff;
        text-align: center;
        font-size: 16px;
        padding: 1px;
        cursor: pointer;
    }

    .inner {
        width: 100%;
        height: 100%;
    }

    .wrapper, .inner {
        border-radius: 5px;
    }
</style>

<div class="wrapper">
    <div class="inner">CLICK ME!!!</div>
</div>
```

This is the result: a nice **css3 gradient border**

{{< unsafe >}}
<style>
    .inner, .wrapper:hover {
        background: #e2017b;
        background: -moz-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #e2017b), color-stop(100%, #640037));
        background: -webkit-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: -o-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: -ms-linear-gradient(top, #e2017b 0%, #640037 100%);
        background: linear-gradient(top, #e2017b 0%, #640037 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#e2017b', endColorstr='#640037', GradientType=0);
    }

    .wrapper, .inner:hover {
        background: #640037;
        background: -moz-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #640037), color-stop(100%, #e2017b));
        background: -webkit-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: -o-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: -ms-linear-gradient(top, #640037 0%, #e2017b 100%);
        background: linear-gradient(top, #640037 0%, #e2017b 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#640037', endColorstr='#e2017b', GradientType=0);
    }

    .wrapper {
        width: 100px;
        height: 30px;
        line-height: 30px;
        color: #fff;
        text-align: center;
        font-size: 16px;
        padding: 1px;
        cursor: pointer;
    }

    .inner {
        width: 100%;
        height: 100%;
    }

    .wrapper, .inner {
        border-radius: 5px;
    }
</style>

<div class="wrapper">
    <div class="inner">CLICK ME!!!</div>
</div>
{{< /unsafe >}}

This code is compatible with ie7,8,9,ffox,chrome; on Microsoft's browsers rounded corners are not showed. For me this is
an acceptable 'graceful degradation'.

There is a css3 property that let you set an image as a
border: [border-image](http://css-tricks.com/understanding-border-image/ "css3 border-image property"), but at the
moment is completely missing on ie.

Gradients are generated with
Ultimate [CSS Gradient Generator](http://www.colorzilla.com/gradient-editor/ "CSS Gradient Generator by ColorZilla")
