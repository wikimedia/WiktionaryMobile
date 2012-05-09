/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  AppDelegate.m
//  Wikipedia-iOS
//
//  Created by Yuvi Panda on 24/02/12.
//  Copyright yuvipanda@gmail.com 2012. All rights reserved.
//

#import "AppDelegate.h"
#import "MainViewController.h"

#ifdef PHONEGAP_FRAMEWORK
#import <PhoneGap/PGPlugin.h>
#import <PhoneGap/PGURLProtocol.h>
#else
#import "PGPlugin.h"
#import "PGURLProtocol.h"
#endif

/* 
 Returns YES if it is at least version specified as NSString(X)
 Usage: 
 if (IsAtLeastiOSVersion(@"5.1")) {
 // do something for iOS 5.1 or greater
 }
 */
#define IsAtLeastiOSVersion(X) ([[[UIDevice currentDevice] systemVersion] compare:X options:NSNumericSearch] != NSOrderedAscending)


@implementation AppDelegate

@synthesize invokeString, window, viewController;

- (id) init
{	
    
    /* Fix problem with ios 5.0.1+ and Webkit databases described at the following urls:
     *   https://issues.apache.org/jira/browse/CB-347
     *   https://issues.apache.org/jira/browse/CB-330
     * My strategy is to move any existing database from default paths
     * to Documents/ and then changing app preferences accordingly
     * This is done here so that we don't crash from a 2.x -> 3.x upgrade, which have different 
     * Webkit settings paths. See above link for details.
     * This goes in init since we're initializing a webview here to get the useragent
     * So we can set the useragent. Is repeated on didFinishLaunchingWithOptions too
     */
    
    NSString* library = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)objectAtIndex:0];
    NSString* documents = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    
    NSString *localStorageSubdir = (IsAtLeastiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/LocalStorage";
    NSString *localStoragePath = [library stringByAppendingPathComponent:localStorageSubdir];
    NSString *localStorageDb = [localStoragePath stringByAppendingPathComponent:@"file__0.localstorage"];
    
    NSString *WebSQLSubdir = (IsAtLeastiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/Databases";
    NSString *WebSQLPath = [library stringByAppendingPathComponent:WebSQLSubdir];
    NSString *WebSQLIndex = [WebSQLPath stringByAppendingPathComponent:@"Databases.db"];
    NSString *WebSQLDb = [WebSQLPath stringByAppendingPathComponent:@"file__0"];
    
    NSString *ourLocalStoragePath = [documents stringByAppendingPathComponent:@"LocalStorage"];;
    NSString *ourLocalStorageDb = [ourLocalStoragePath stringByAppendingPathComponent:@"file__0.localstorage"];
    
    NSString *ourWebSQLPath = [documents stringByAppendingPathComponent:@"Databases"];
    NSString *ourWebSQLIndex = [ourWebSQLPath stringByAppendingPathComponent:@"Databases.db"];
    NSString *ourWebSQLDb = [ourWebSQLPath stringByAppendingPathComponent:@"file__0"];
    
    NSFileManager* fileManager = [NSFileManager defaultManager];
    
    BOOL copy;
    NSError *err = nil; 
    copy = [fileManager fileExistsAtPath:localStorageDb] && ![fileManager fileExistsAtPath:ourLocalStorageDb];
    if (copy) {
        [fileManager createDirectoryAtPath:ourLocalStoragePath withIntermediateDirectories:YES attributes:nil error:&err];
        [fileManager copyItemAtPath:localStorageDb toPath:ourLocalStorageDb error:&err];
        if (err == nil)
            [fileManager removeItemAtPath:localStorageDb error:&err];
    }
    
    err = nil;
    copy = [fileManager fileExistsAtPath:WebSQLPath] && ![fileManager fileExistsAtPath:ourWebSQLPath];
    if (copy) {
        [fileManager createDirectoryAtPath:ourWebSQLPath withIntermediateDirectories:YES attributes:nil error:&err];
        [fileManager copyItemAtPath:WebSQLIndex toPath:ourWebSQLIndex error:&err];
        [fileManager copyItemAtPath:WebSQLDb toPath:ourWebSQLDb error:&err];
        if (err == nil)
            [fileManager removeItemAtPath:WebSQLPath error:&err];
    }
    
    NSUserDefaults* appPreferences = [NSUserDefaults standardUserDefaults];
    NSBundle* mainBundle = [NSBundle mainBundle];
    
    NSString *bundlePath = [[mainBundle bundlePath] stringByDeletingLastPathComponent];
    NSString *bundleIdentifier = [[mainBundle infoDictionary] objectForKey:@"CFBundleIdentifier"];
    NSString* libraryPreferences = @"Library/Preferences";
    
    NSString* appPlistPath = [[bundlePath stringByAppendingPathComponent:libraryPreferences]    stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.plist", bundleIdentifier]];
    NSMutableDictionary* appPlistDict = [NSMutableDictionary dictionaryWithContentsOfFile:appPlistPath];
    
    BOOL dirty = NO;
    
    NSString *value;
    NSString *key = @"WebKitLocalStorageDatabasePathPreferenceKey";
    value = [appPlistDict objectForKey: key];
    if (![value isEqual:ourLocalStoragePath]) {
        [appPlistDict setValue:ourLocalStoragePath forKey:key];
        dirty = YES;
    }
    
    key = @"WebDatabaseDirectory";
    value = [appPlistDict objectForKey: key];
    if (![value isEqual:ourWebSQLPath]) {
        [appPlistDict setValue:ourWebSQLPath forKey:key];
        dirty = YES;
    }
    
    if (dirty) 
    {
        BOOL ok = [appPlistDict writeToFile:appPlistPath atomically:YES];
        NSLog(@"Fix applied for database locations?: %@", ok? @"YES":@"NO");
        [appPreferences synchronize];
    }

    
    UIWebView *webView = [[UIWebView alloc] initWithFrame:CGRectZero];
    NSString *currentUserAgent = [webView stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
    
    NSDictionary *userAgentDictionary = [[NSDictionary alloc] initWithObjectsAndKeys:[NSString stringWithFormat:@"%@%@",@"WikipediaMobile/3.1 ",currentUserAgent], @"UserAgent", nil];
    [webView release];
    
    [[NSUserDefaults standardUserDefaults] registerDefaults:userAgentDictionary];    
    [userAgentDictionary release];
    
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage]; 
    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];
    [PGURLProtocol registerPGHttpURLProtocol];
    
    return [super init];
}

#pragma UIApplicationDelegate implementation

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{   
    /* Fix problem with ios 5.0.1+ and Webkit databases described at the following urls:
     *   https://issues.apache.org/jira/browse/CB-347
     *   https://issues.apache.org/jira/browse/CB-330
     * My strategy is to move any existing database from default paths
     * to Documents/ and then changing app preferences accordingly
     * This is done here so that the database changes actually persist. 
     */
    
    NSString* library = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)objectAtIndex:0];
    NSString* documents = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    
    NSString *localStorageSubdir = (IsAtLeastiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/LocalStorage";
    NSString *localStoragePath = [library stringByAppendingPathComponent:localStorageSubdir];
    NSString *localStorageDb = [localStoragePath stringByAppendingPathComponent:@"file__0.localstorage"];
    
    NSString *WebSQLSubdir = (IsAtLeastiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/Databases";
    NSString *WebSQLPath = [library stringByAppendingPathComponent:WebSQLSubdir];
    NSString *WebSQLIndex = [WebSQLPath stringByAppendingPathComponent:@"Databases.db"];
    NSString *WebSQLDb = [WebSQLPath stringByAppendingPathComponent:@"file__0"];
    
    NSString *ourLocalStoragePath = [documents stringByAppendingPathComponent:@"LocalStorage"];;
    NSString *ourLocalStorageDb = [ourLocalStoragePath stringByAppendingPathComponent:@"file__0.localstorage"];
    
    NSString *ourWebSQLPath = [documents stringByAppendingPathComponent:@"Databases"];
    NSString *ourWebSQLIndex = [ourWebSQLPath stringByAppendingPathComponent:@"Databases.db"];
    NSString *ourWebSQLDb = [ourWebSQLPath stringByAppendingPathComponent:@"file__0"];
    
    NSFileManager* fileManager = [NSFileManager defaultManager];
    
    BOOL copy;
    NSError *err = nil; 
    copy = [fileManager fileExistsAtPath:localStorageDb] && ![fileManager fileExistsAtPath:ourLocalStorageDb];
    if (copy) {
        [fileManager createDirectoryAtPath:ourLocalStoragePath withIntermediateDirectories:YES attributes:nil error:&err];
        [fileManager copyItemAtPath:localStorageDb toPath:ourLocalStorageDb error:&err];
        if (err == nil)
            [fileManager removeItemAtPath:localStorageDb error:&err];
    }
    
    err = nil;
    copy = [fileManager fileExistsAtPath:WebSQLPath] && ![fileManager fileExistsAtPath:ourWebSQLPath];
    if (copy) {
        [fileManager createDirectoryAtPath:ourWebSQLPath withIntermediateDirectories:YES attributes:nil error:&err];
        [fileManager copyItemAtPath:WebSQLIndex toPath:ourWebSQLIndex error:&err];
        [fileManager copyItemAtPath:WebSQLDb toPath:ourWebSQLDb error:&err];
        if (err == nil)
            [fileManager removeItemAtPath:WebSQLPath error:&err];
    }
    
    NSUserDefaults* appPreferences = [NSUserDefaults standardUserDefaults];
    NSBundle* mainBundle = [NSBundle mainBundle];
    
    NSString *bundlePath = [[mainBundle bundlePath] stringByDeletingLastPathComponent];
    NSString *bundleIdentifier = [[mainBundle infoDictionary] objectForKey:@"CFBundleIdentifier"];
    NSString* libraryPreferences = @"Library/Preferences";
    
    NSString* appPlistPath = [[bundlePath stringByAppendingPathComponent:libraryPreferences]    stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.plist", bundleIdentifier]];
    NSMutableDictionary* appPlistDict = [NSMutableDictionary dictionaryWithContentsOfFile:appPlistPath];
    
    NSString *value;
    NSString *key = @"WebKitLocalStorageDatabasePathPreferenceKey";
    value = [appPlistDict objectForKey: key];
    if (![value isEqual:ourLocalStoragePath]) {
        [appPlistDict setValue:ourLocalStoragePath forKey:key];
    }
    
    key = @"WebDatabaseDirectory";
    value = [appPlistDict objectForKey: key];
    if (![value isEqual:ourWebSQLPath]) {
        [appPlistDict setValue:ourWebSQLPath forKey:key];
    }
    
    BOOL ok = [appPlistDict writeToFile:appPlistPath atomically:YES];
    NSLog(@"Fix applied for database locations?: %@", ok? @"YES":@"NO");
    [appPreferences synchronize];

    
    NSURL* url = [launchOptions objectForKey:UIApplicationLaunchOptionsURLKey];
    if (url && [url isKindOfClass:[NSURL class]]) {
        self.invokeString = [url absoluteString];
		NSLog(@"TEst launchOptions = %@", url);
    }    
    
    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
    self.window.autoresizesSubviews = YES;
    
    CGRect viewBounds = [[UIScreen mainScreen] applicationFrame];
    
    self.viewController = [[[MainViewController alloc] init] autorelease];
    self.viewController.useSplashScreen = YES;
    self.viewController.wwwFolderName = @"www";
    self.viewController.startPage = @"index.html";
    self.viewController.view.frame = viewBounds;
    
    // over-ride delegates
    self.viewController.webView.delegate = self;
    self.viewController.commandDelegate = self;
    
    // check whether the current orientation is supported: if it is, keep it, rather than forcing a rotation
    BOOL forceStartupRotation = YES;
    UIDeviceOrientation curDevOrientation = [[UIDevice currentDevice] orientation];
    
    if (UIDeviceOrientationUnknown == curDevOrientation) {
        // UIDevice isn't firing orientation notifications yet… go look at the status bar
        curDevOrientation = (UIDeviceOrientation)[[UIApplication sharedApplication] statusBarOrientation];
    }
    
    if (UIDeviceOrientationIsValidInterfaceOrientation(curDevOrientation)) {
        for (NSNumber *orient in self.viewController.supportedOrientations) {
            if ([orient intValue] == curDevOrientation) {
                forceStartupRotation = NO;
                break;
            }
        }
    } 
    
    if (forceStartupRotation) {
        NSLog(@"supportedOrientations: %@", self.viewController.supportedOrientations);
        // The first item in the supportedOrientations array is the start orientation (guaranteed to be at least Portrait)
        UIInterfaceOrientation newOrient = [[self.viewController.supportedOrientations objectAtIndex:0] intValue];
        NSLog(@"AppDelegate forcing status bar to: %d from: %d", newOrient, curDevOrientation);
        [[UIApplication sharedApplication] setStatusBarOrientation:newOrient];
    }
    
    [self.window addSubview:self.viewController.view];
    [self.window makeKeyAndVisible];
    
    return YES;
}

// this happens while we are running ( in the background, or from within our own app )
// only valid if FooBar.plist specifies a protocol to handle
- (BOOL) application:(UIApplication*)application handleOpenURL:(NSURL*)url 
{
    if (!url) { 
        return NO; 
    }
    
	// calls into javascript global function 'handleOpenURL'
    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];
    
    // all plugins will get the notification, and their handlers will be called 
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:PGPluginHandleOpenURLNotification object:url]];
    
    return YES;    
}

#pragma PGCommandDelegate implementation

- (id) getCommandInstance:(NSString*)className
{
	return [self.viewController getCommandInstance:className];
}

- (BOOL) execute:(InvokedUrlCommand*)command
{
	return [self.viewController execute:command];
}

- (NSString*) pathForResource:(NSString*)resourcepath;
{
	return [self.viewController pathForResource:resourcepath];
}

#pragma UIWebDelegate implementation

- (void) webViewDidFinishLoad:(UIWebView*) theWebView 
{
	// only valid if FooBar.plist specifies a protocol to handle
	if (self.invokeString)
	{
		// this is passed before the deviceready event is fired, so you can access it in js when you receive deviceready
		NSString* jsString = [NSString stringWithFormat:@"var invokeString = \"%@\";", self.invokeString];
		[theWebView stringByEvaluatingJavaScriptFromString:jsString];
	}
	
    if ([theWebView respondsToSelector:@selector(scrollView)]) {
        theWebView.scrollView.scrollEnabled = NO;
    } else {
        for (UIView* view in theWebView.subviews) {
            if ([view isKindOfClass: [UIScrollView class]]) {
                ((UIScrollView*) view).scrollEnabled = NO;
            }
        }
    }
    
    // Black base color for background matches the native apps
   	theWebView.backgroundColor = [UIColor blackColor];
    
	return [self.viewController webViewDidFinishLoad:theWebView];
}

- (void) webViewDidStartLoad:(UIWebView*)theWebView 
{
	return [self.viewController webViewDidStartLoad:theWebView];
}

- (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error 
{
	return [self.viewController webView:theWebView didFailLoadWithError:error];
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
	return [self.viewController webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}

- (void) dealloc
{
	[super dealloc];
}

@end
