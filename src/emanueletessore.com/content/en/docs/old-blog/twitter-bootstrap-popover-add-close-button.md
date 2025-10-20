---
title: 'How to add a close button to Bootstrap Popover'
date: Wed, 26 Mar 2014 10:16:45 +0000
draft: false
tags: ['JavaScript', 'twitter bootstrap']
disqus_url: http://www.emanueletessore.com/twitter-bootstrap-popover-add-close-button/
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg
---

Recently I had to build a 'smart booking form' for a group of hotels. The website is made on Twitter's Bootstrap and is fully responsive. 

Troubles began when I had to ask the guest for his children's age, only if he's telling the form he has children. 

Here the **Twitter Popover feature** comes very handy: if the guest selects one or more children a popover will be shown. 

The hard part is to understand when this popover have to be closed. To make the guest the most comfortable possible **let's put a nice X on the top right corner of the popover**. 

This is how I added a **close button to Twitter Bootstrap Popover** in javascript: 

```javascript
// Popover for the quick search additional fields
jQuery('.popover-test').popover({ 
	html : true, 
	content: function() {
		return $(jQuery(this).data('target-selector')).html();
	},
	title: function(){
		return jQuery(this).data('title')+'<span class="close">&times;</span>';
	}
}).on('shown.bs.popover', function(e){
	var popover = jQuery(this);
	jQuery(this).parent().find('div.popover .close').on('click', function(e){
		popover.popover('hide');
	});
});
```

Please be advise this code must be inserted in **document ready** function. 

And this is the HTML: 

```html
<a 
	id="children-age-toggler"
	data-target-selector="#children-age" 
	data-placement="bottom"
	href="javascript:;"
	class="children-age popover-children"
	data-title="Children's Age"
></a>
<div id="children-age" class="hidden">
	<p>Please select your children's Age</p>
	<!-- put here more html forms and stuff -->
</div>
```