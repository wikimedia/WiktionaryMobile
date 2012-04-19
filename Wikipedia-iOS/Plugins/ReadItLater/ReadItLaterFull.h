//
//  ReadItLaterFull.h
//  ReadItLaterAPI
//
//  Created by Nathan Weiner on 8/26/09.
//  Copyright 2009 Idea Shower. All rights reserved.
//

#import "ReadItLaterLite.h"
#import <UIKit/UIKit.h>



@interface ReadItLaterFullView : UIViewController <UITableViewDelegate, UITableViewDataSource, UITextFieldDelegate> {
	
	UILabel *setupText;
	UIButton *learnMoreButton;
	UITableView *tableView;
	UITextField *usernameField;
	UITextField *passwordField;
	UITextField *confirmPasswordField;
	UISegmentedControl *viewTypeControl;
	
	BOOL keyboardShown;
	UITextField *activeField;
	BOOL setupFinished;
	
	NSURL *pendingUrl;
	NSString *pendingTitle;
	
	id delegate;
	
}

@property (nonatomic, retain) UILabel *setupText;
@property (nonatomic, retain) UIButton *learnMoreButton;
@property (nonatomic, retain) UITableView *tableView;
@property (nonatomic, retain) UITextField *usernameField;
@property (nonatomic, retain) UITextField *passwordField;
@property (nonatomic, retain) UITextField *confirmPasswordField;
@property (nonatomic, retain) UISegmentedControl *viewTypeControl;

@property (nonatomic) BOOL keyboardShown;
@property (nonatomic, assign) UITextField *activeField;

@property (nonatomic, retain) NSURL *pendingUrl;
@property (nonatomic, retain) NSString *pendingTitle;

@property (nonatomic) BOOL setupFinished;
@property (nonatomic, assign) id delegate;


@end



@interface ReadItLaterFull : NSObject {
	
	UIViewController *baseViewController;
	UINavigationController *navController;
	ReadItLaterFullView *fullView;
	
	UIView *spinnerWrapper;
	UIActivityIndicatorView *spinner;
	UILabel *spinnerLabel;
	UIButton *spinnerButton;
	BOOL releaseAfterSpinnerCancel;
	
}
@property (nonatomic, retain) UIViewController *baseViewController;
@property (nonatomic, assign) UINavigationController *navController;
@property (nonatomic, assign) ReadItLaterFullView *fullView;

@property (nonatomic, retain) UIView *spinnerWrapper;
@property (nonatomic, retain) UIActivityIndicatorView *spinner;
@property (nonatomic, retain) UILabel *spinnerLabel;
@property (nonatomic, retain) UIButton *spinnerButton;
@property (nonatomic) BOOL releaseAfterSpinnerCancel;	


// METHODS FOR SAVING A LINK TO READ IT LATER
// for documentation, screenshots, examples, see http://readitlaterlist.com/api_iphone/
// Additional methods are available in the ReadItLaterLite class (see the note at the top of this file for more)

// SIMPLEST:	Let RIL do all of the work for you
// REQUIRES: ReadItLaterViews.h
// --------------------------------------------
// Save a link to Read It Later, RIL will show displays over your UI notifying user of progress/result

// Arguments:
// url - NSURL - link to the page to save
// title - NSString - (optional nil) - title of the page you are saving.  For the best user experience please provide a unique way of identifying the link.  
//									If you have the page loaded in a UIWebView, you can retrieve the title with: 
//									NSString *title = [yourWebView stringByEvaluatingJavaScriptFromString:@"document.title"];
// username - NSString - (optional) - if not provided, this needs to be stored in NSUserDefaults in the key 'ReadItLaterUsername'
// password - NSString - (optional) - if not provided, this needs to be stored in NSUserDefaults in the key 'ReadItLaterPassword'

// Example of use: [ReadItLater save:[NSURL urlWithString:@"http://google.com"] title:@"Google"]

+(void)save:(NSURL *)url title:(NSString *)title;
+(void)save:(NSURL *)url title:(NSString *)title username:(NSString *)username password:(NSString *)password;




/* ----------------------------------- */

// METHODS FOR HANDLING LOGINS/SIGNUPS
// for documentation, screenshots, examples, see http://readitlaterlist.com/api_iphone/
// Additional methods are available in the ReadItLaterLite class (see the note at the top of this file for more)


// SIMPLIEST:	A screen will popup over your application (without leaving it) and allow the user to signup or login.  
// REQUIRES: ReadItLaterViews.h
// ------------------------
// Allow RIL signups and logins with one single line of code without leaving your app!
// After the user successfully logs in (or signs up), their username and password will be stored in NSUserDefaults with the following keys:
// NSUserDefault key: @"ReadItLaterUsername" - user's username
// NSUserDefault key: @"ReadItLaterPassword" - user's password

// Arguments: none

+(void)showUserSetup;



// you shouldn't need to call this function directly
+(void)showUserSetupSaveWhenDone:(NSURL *)url title:(NSString *)title;

@end
