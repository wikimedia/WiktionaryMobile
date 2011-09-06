function init() 
{
    // the next line makes it impossible to see Contacts on the HTC Evo since it
    // doesn't have a scroll button
    // document.addEventListener("touchmove", preventBehavior, false);  
    document.addEventListener("deviceready", loadContent, true);
}

function loadContent() 
{
	document.getElementById("main").src = "http://en.m.wikipedia.org";
}