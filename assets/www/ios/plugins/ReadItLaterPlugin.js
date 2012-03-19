ReadItLaterPlugin = function() {
	
}

ReadItLaterPlugin.prototype.saveToReadItLater = function(successCallback, options) {
	// successCallback required
	if (typeof successCallback != "function") {
        console.log("ReadItLaterPlugin Error: successCallback is not a function");
        return;
    }
		
	PhoneGap.exec(successCallback, null, "ReadItLaterPlugin","saveToReadItLater",[options]);
};

PhoneGap.addConstructor(function(){
	if(!window.plugins) {
		window.plugins = {};
	}
	window.plugins.readItLaterPlugin = new ReadItLaterPlugin();
});