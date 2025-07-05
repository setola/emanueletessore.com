---
title: 'Paypal - my zip code is not correct'
date: Thu, 11 Dec 2014 14:45:56 +0000
draft: false
tags: ['News']
---

Recently I had to enter an alternative address for my **PayPal** account.

I was stuck while attempting to insert the **zip code** because my five digits zip code was not validated by the PayPal
interface.

Usually javascript takes care of such kind of validation.

So I was able to dig into the code searching for a way to override it :)

This is a screenshot of what the PayPal add address form looks like when you try to insert a **valid zip code**

![PayPal zip error](/old-blog/paypal-zip-code-correct/PayPal-zip-error.png) The Solution:

1. compile the form with your data
2. open your browser developer tools by pressing F12 key.
3. go to the Console tab
4. enter this code `jQuery('form[name="addAddress"]').submit();` and press enter

If you're trying to modify an address you have to change `addAddress` with `editAddress`.
What this means? we're using an online payment method where

1. developers don't test all the features they implement before go live
2. developers don't validate user input serverside everywhere
3. `pattern="/^(I-|IT-)?\d{5}$/i" maxlength="7"` "IT-" and 5 digits means the string length is 8, not 7 :)

This doesn't seems to be a really huge security bug, but a standard user will not be able to add or modify an address...
so please PayPal fix this :)