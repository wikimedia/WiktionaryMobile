//
//  ReadItLaterPlugin.m
//  ReadItLaterPlugin
//
//  Created by Tommy-Carlos Williams (tommy@devgeeks.org) on 16/03/12.
//  Copyright (c) 2012 Tommy-Carlos Williams. All rights reserved.
//  MIT Licensed
//

#import "ReadItLaterPlugin.h"
#import "ReadItLaterFull.h"

@implementation ReadItLaterPlugin

@synthesize callbackId;

-(PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (ReadItLaterPlugin*)[super initWithWebView:theWebView];
    return self;
}

- (void)saveToReadItLater:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	self.callbackId = arguments.pop;
		
	NSString* RILURL = [options objectForKey:@"url"];
	NSString* RILTitle = [options objectForKey:@"title"];
	
	[ReadItLaterFull save:[NSURL URLWithString:RILURL] title:RILTitle];
	
	PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsInt: 1];
	[self.webView stringByEvaluatingJavaScriptFromString:[result toSuccessCallbackString: self.callbackId]];

}

- (void)dealloc
{	
	[callbackId release];
    [super dealloc];
}


@end
