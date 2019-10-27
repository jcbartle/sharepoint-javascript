# sharepoint-javascript
Repository for interacting with SharePoint via JavaScript.

## Getting Started

These files are intended to be use individually and included in SharePoint pages via a Script Editor web part (of course, you could put the JS code directly into the SE web part). For an actual deployment, I would package the functionality together into a single JS file which is referenced in the masterpage for the SP site rather than referencing the code on each individual page. Basically, I'm just trying to get you started with individual features, and you can decide how best to incorporate that into your environment.

### Prerequisites

Well, you're going to need SharePoint. I'm developing all of this code on SharePoint Online using classic SharePoint. Modern SharePoint is a different beast and is not referenced here.

### Installing

As an example, you could do the following to use the Like.js code:

1. Upload the Like.js file to your SiteAssets folder.
2. Make sure you have the rating system enabled and set to Like for the library in question.
3. Include a Script Editor web part on the page in question.
4. Insert this in the Script Editor contents: `<script src="../SiteAssets/Like.js"></script>`

## Like.js

This file enables the following functionality:

* On page load, determines how many, if any, likes the page has and displays appropriate verbiage.
* Allows people to like/unlike the page.

I have chosen to use the SharePoint ms-descriptiontext DIV to hold the information. This is the DIV which displays the default SP "Last Modified at <date> <time> by <user>" text, so it made sense to me to use this DIV for the like information. Obviously, you can change this by editing the code.
  
To give credit where credit is due, the following page got me started on creating this functionality. I feel my implementation is quite a bit more advanced, but this did get me started.

http://npatro.com/using-like-and-rating-functionality-in-sharepoint-2013-pages/
