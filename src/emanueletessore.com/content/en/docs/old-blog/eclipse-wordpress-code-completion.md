---
title: 'Eclipse: WordPress Code Completion'
date: Sun, 14 Oct 2012 14:18:50 +0000
draft: false
tags: ['eclipse', 'PHP', 'wordpress']
disqus_url: http://www.emanueletessore.com/eclipse-wordpress-code-completion/
---

**WordPress** is one of the most known and used CMS in the web.

**Eclipse** is one of the most know and used IDE in the web. Why they shouldn't love each other???

The answer is simply: they do... if you edit 2 files.

**Code Completion** is one of the absolutely needed feature for an Integrated Development Environment such as **
Eclipse**.

Eclipse, born for Java developing, nowadays support almost every open language with the help of an huge number of
plugins.

PHP is included in this list. There is a ready to use suite
codenamed [PDT](http://www.eclipse.org/projects/project.php?id=tools.pdt "Eclipse PHP Developing Tools") (PHP Developing
Tools) and tons of how-to install it.

To add the **WordPress code completion in Eclipse** you have to follow these steps:

1. **Download and unzip WordPress** into a local folder: mine
   is `C:/Program Files/eclipse/workspaces/webdev/WordPress/wordpress-3.4.2`  
   cause I've multiple workspaces and multiple wordpress versions. 3.4.2 was the last one stable when I wrote this
   article.
2. **close Eclipse**
3. **go to your workspace folder**; mine is in `C:/Program Files/eclipse/workspaces/webdev/`
4. enter `RemoteSystemsTempFiles` project folder
5. **edit the file** `.project` wit your favorite text editor: I use notepad++. **Don't use Eclipse for this task.**
6. **write** down this: 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<projectDescription>
   <name>RemoteSystemsTempFiles</name>
   <comment></comment>
   <projects>
   </projects>
   <buildSpec>
      <buildCommand>
         <name>org.eclipse.dltk.core.scriptbuilder</name>
         <arguments>
         </arguments>
      </buildCommand>
      <buildCommand>
         <name>org.eclipse.php.core.PhpIncrementalProjectBuilder</name>
         <arguments>
         </arguments>
      </buildCommand>
      <buildCommand>
         <name>org.eclipse.wst.validation.validationbuilder</name>
         <arguments>
         </arguments>
      </buildCommand>
   </buildSpec>
   <natures>
      <nature>org.eclipse.rse.ui.remoteSystemsTempNature</nature>
      <nature>org.eclipse.php.core.PHPNature</nature>
   </natures>
</projectDescription>
```

7. **open the file** `.buildpath` and write this: 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<buildpath>
   <buildpathentry kind="src" path=""/>
   <buildpathentry kind="con" path="org.eclipse.php.core.LANGUAGE"/>
   <buildpathentry external="true" kind="lib" path="C:/Program Files/eclipse/workspaces/webdev/WordPress/wordpress-3.4.2"/>
</buildpath> 
```

8. **Remember to change my wp install path with yours!!!**
9. **Save and close** all files, open Eclipse and start coding happy
10. **Open Eclipse and start coding happy**