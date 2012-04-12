//
//  ReadItLaterFull.m
//  ReadItLaterAPI
//
//  Created by Nathan Weiner on 8/26/09.
//  Copyright 2009 Idea Shower. All rights reserved.
//

#import "ReadItLaterFull.h"
#import "AppDelegate.h"

#pragma mark Coordinator / VC delegate

// JY 4/12/12 Private class extension moved from 'private' category in header
@interface ReadItLaterFull ()

-(id)openSetup:(NSURL *)url title:(NSString *)title;
-(void)showMessage:(NSString *)message loading:(BOOL)loading;
-(BOOL)handleError:(NSString *)error;
-(void)hideMessageAndReleaseWhenDone:(BOOL)release;
-(void)showSpinnerCancelButton;
-(void)done;

@end

@implementation ReadItLaterFull

@synthesize baseViewController, navController, fullView;
@synthesize spinnerWrapper, spinner, spinnerLabel, spinnerButton, releaseAfterSpinnerCancel;



/* ----------------------------------- */

// Saving Methods, see ReadItLaterFull.h for comments/documentation

+(void)save:(NSURL *)url title:(NSString *)title {
	
	NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
	NSString *username = [prefs objectForKey:@"ReadItLaterUsername"];
	NSString *password = [prefs objectForKey:@"ReadItLaterPassword"];
	if (!username) {
		[ReadItLaterFull showUserSetupSaveWhenDone:url title:title];
	} else {
		[ReadItLaterFull save:url title:title username:username password:password];
	}
	
}
+(void)save:(NSURL *)url title:(NSString *)title username:(NSString *)username password:(NSString *)password {
	
	ReadItLaterFull *readItLaterFull = [ReadItLaterFull alloc]; // Will release itself when finished
	readItLaterFull.releaseAfterSpinnerCancel = YES;
	[readItLaterFull showMessage:@"Saving" loading:YES];
	[ReadItLater save:url title:title delegate:readItLaterFull username:username password:password];
	
}




/* ----------------------------------- */

// Login/Signup Methods, see ReadItLaterFull.h for comments/documentation

+(void)showUserSetup {
	
	[ReadItLaterFull showUserSetupSaveWhenDone:nil title:nil];
	
}
+(void)showUserSetupSaveWhenDone:(NSURL *)url title:(NSString *)title {
	
	// Create and login/setup view.  
	[[ReadItLaterFull alloc] openSetup:url title:title];
	// release : Views will release themselves when closed
	
}



///////////////////











// --
// The rest of the methods below are used by the methods above to make the interface
// Unless you plan on modifying the interface, there is nothing below you need to edit
// -- 


-(void)readItLaterSaveFinished:(NSString *)stringResponse error:(NSString *)error {
	
	if ([self handleError:error]) {
		[self showMessage:@"Saved!" loading:NO];
		[self hideMessageAndReleaseWhenDone:YES];
	}
	
}

//

-(BOOL)handleError:(NSString *)error {
	
	if (error != nil)
	{
		
		[self showMessage:error loading:NO];
		[self showSpinnerCancelButton];
		return NO;
	} 
	
	return YES;
}






-(id)openSetup:(NSURL *)url title:(NSString *)title {
    
	self = [super init];
    
    // JY 4/12/12 Now presents from the base AppDelegate view controller instead of creating a new stack.
    // This allows rotation events to propagate along properly, but only works without further thought
    // because the base view controller conveniently happens to be the one we want to present from.
    // If other view controllers are being used, this might cause problems. For PhoneGap it's fine for now.
    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;	
    self.baseViewController = appDelegate.viewController;
    
    // Create the fullView
	self.fullView = [[ReadItLaterFullView alloc] initWithNibName:nil bundle:nil];
	fullView.delegate = self;
	
	self.navController = [[UINavigationController alloc] initWithRootViewController:self.fullView];
    
    [self.baseViewController presentModalViewController:self.navController animated:YES];
	
	
	if (url != nil) {
		fullView.pendingUrl = url;
		fullView.pendingTitle = title;
	}
	
	return self;
	
}

-(void)remove {
	[self.baseViewController dismissModalViewControllerAnimated:YES];
}

/*-(void)removeTheController {
 [baseViewController.view performSelector:@selector(removeFromSuperview) withObject:nil afterDelay:0.01];	
 }*/

- (void)dealloc {
	[baseViewController release];
    [super dealloc];
}



// -- Loading Spinner : Used in Simple Methods that take care of display -- //

-(void)showMessage:(NSString *)message loading:(BOOL)loading  {
	
	if (spinner == nil) {
		
		self.spinnerWrapper = [[UIView alloc] initWithFrame:[[UIApplication sharedApplication] keyWindow].frame];
		[ [[UIApplication sharedApplication] keyWindow] addSubview:spinnerWrapper];
		[spinnerWrapper release];
		
		UIView *bg = [[UIView alloc] initWithFrame:spinnerWrapper.frame];
		bg.alpha = 0.9;
		bg.opaque = YES;
		bg.backgroundColor = [UIColor blackColor];
		[spinnerWrapper addSubview:bg];
		[bg release];
		
		self.spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
		spinner.frame = CGRectMake(spinnerWrapper.frame.size.width / 2 - 17 , spinnerWrapper.frame.size.height / 2 - 17 - 30, 37, 37);
		[spinnerWrapper addSubview:spinner];
		[spinner release];
		
		self.spinnerLabel = [[UILabel alloc] initWithFrame:CGRectMake(15, spinnerWrapper.frame.size.height/2 - 25, spinnerWrapper.frame.size.width-30, 100)];
		spinnerLabel.textAlignment = UITextAlignmentCenter;
		spinnerLabel.backgroundColor = [UIColor clearColor];
		spinnerLabel.opaque = NO;
		spinnerLabel.textColor = [UIColor whiteColor];
		spinnerLabel.font = [UIFont boldSystemFontOfSize:17];
		spinnerLabel.lineBreakMode = UILineBreakModeWordWrap;
		spinnerLabel.numberOfLines = 5;
		[spinnerWrapper addSubview:spinnerLabel];
		
	}
	
	spinnerLabel.text = message;
	
	if (loading) {
		[spinner startAnimating];
	} else {
		[spinner stopAnimating];
	}
	
	[UIApplication sharedApplication].networkActivityIndicatorVisible = loading;
	
	spinnerWrapper.hidden = NO;
	spinnerButton.hidden = YES;
	
}

-(void)showSpinnerCancelButton {
	if (spinnerButton == nil) {
		self.spinnerButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
		spinnerButton.frame = CGRectMake(spinnerWrapper.frame.size.width / 2 - 75 , spinnerWrapper.frame.size.height / 2 - 17 - 30, 150, 37);
		[spinnerButton setTitle:@"Close" forState:UIControlStateNormal];
		[spinnerButton addTarget:self action:@selector(spinnerCancelled) forControlEvents:UIControlEventTouchDown];
		[spinnerWrapper addSubview:spinnerButton];
	}
	spinnerButton.hidden = NO;
}

-(void)spinnerCancelled {
	if (releaseAfterSpinnerCancel) {
		[self done];
	} else {
		spinnerWrapper.hidden = YES;
	}
}

-(void)hideMessageAndReleaseWhenDone:(BOOL)release {
	
	spinnerWrapper.alpha = 1;
	
	[UIView beginAnimations:nil context:NULL];
	[UIView setAnimationDuration:1.0f];
	if (release) {
		[UIView setAnimationDelegate:self];
		[UIView setAnimationDidStopSelector:@selector(messageHiddenNowRelease)];
	}
	
	spinnerWrapper.alpha = 0;
	
	[UIView commitAnimations];
	
}

-(void)messageHiddenNowRelease {
	[self done];
}

-(void)done {
	[self release];
}



@end


#pragma mark - View Controller


// JY 4/12/12 Private class extension moved from 'private' category in header

@interface ReadItLaterFullView ()

-(void)changeToSignupFinishedScreen;
-(UITextField *)createFormField;

@end


@implementation ReadItLaterFullView

@synthesize viewTypeControl;
@synthesize tableView, setupText, learnMoreButton, usernameField, passwordField, confirmPasswordField;
@synthesize keyboardShown, activeField;
@synthesize pendingUrl, pendingTitle, setupFinished;
@synthesize delegate;






// -- ReadItLaterDelegate -- //

-(void)readItLaterLoginFinished:(NSString *)stringResponse error:(NSString *)error {
	
	if ([delegate handleError:error]) {
		NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
		[prefs setObject:usernameField.text forKey:@"ReadItLaterUsername"];
		[prefs setObject:passwordField.text forKey:@"ReadItLaterPassword"];
		[[delegate spinnerWrapper] setHidden:YES];
		
		// Save the page they tried to save before prompt (if this was the case)
		if (pendingUrl != nil) {
			[ReadItLaterFull save:pendingUrl title:pendingTitle];
		}
		
        [delegate remove];
		[self release];
	}
	
}
-(void)readItLaterSignupFinished:(NSString *)stringResponse error:(NSString *)error {
	
	if ([delegate handleError:error]) {
		NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
		[prefs setObject:usernameField.text forKey:@"ReadItLaterUsername"];
		[prefs setObject:passwordField.text forKey:@"ReadItLaterPassword"];
		[[delegate spinnerWrapper] setHidden:YES];
		
		// Save the page they tried to save before prompt (if this was the case)
		if (pendingUrl != nil) {
			[ReadItLaterFull save:pendingUrl title:pendingTitle];
		}
		
		[self changeToSignupFinishedScreen];
	}
	
}




- (void)loadView {
	
	UIView *view = [[UIView alloc] initWithFrame:CGRectZero];
	[self setView:view];
    
	
	// -- Fill Navigation Bar
	UIBarButtonItem *cancelBtn = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCancel target:self action:@selector(cancelSetup)];
	[self.navigationItem setLeftBarButtonItem:cancelBtn];
	
	UIBarButtonItem *saveBtn = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemSave target:self action:@selector(saveSetup)];
	[self.navigationItem setRightBarButtonItem:saveBtn];
	
	// Middle segment control
	self.viewTypeControl = [[UISegmentedControl alloc] initWithItems:[NSArray arrayWithObjects:@"Login", @"Signup", nil]];
	viewTypeControl.segmentedControlStyle = UISegmentedControlStyleBar;
	viewTypeControl.selectedSegmentIndex = 0;
	
	[viewTypeControl addTarget:self action:@selector(setupViewChanged) forControlEvents:UIControlEventValueChanged];
	
	[self.navigationItem setTitleView:viewTypeControl];
	[viewTypeControl release];
    
}


- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
	
	CGRect frame = self.view.frame;
	NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
	
	
	// -- TableView 
	self.tableView = [[UITableView alloc] initWithFrame:frame
												  style:UITableViewStyleGrouped];
	tableView.dataSource = self;
	tableView.delegate = self;
	[self.view addSubview:tableView];
	[tableView release];
	
	
	// Table header
	UIView *tableHeader = [[UIView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, 90)];
	
	self.setupText = [[UILabel alloc] initWithFrame:CGRectMake(15, 15, frame.size.width-30, 70)];
	setupText.textAlignment = UITextAlignmentLeft;
	setupText.backgroundColor = [UIColor clearColor];
	setupText.opaque = NO;
	setupText.textColor = [UIColor darkGrayColor];
	setupText.font = [UIFont systemFontOfSize:13];
	setupText.lineBreakMode = UILineBreakModeWordWrap;
	setupText.numberOfLines = 4;
	setupText.text = @"Read It Later lets you save web pages to read later, even without\
	an internet connection.\n\nAvailable on the iPhone and any web browser.";
	[tableHeader addSubview:setupText];
	tableView.tableHeaderView = tableHeader;
	
	
	// Table footer
	UIView *tableFooter = [[UIView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, 110)];
	
	self.learnMoreButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
	learnMoreButton.frame = CGRectMake(10, 0, frame.size.width - 20, 37);
	[learnMoreButton setTitle:@"Learn More About Read It Later" forState:UIControlStateNormal];
	[learnMoreButton addTarget:self action:@selector(learnMore) forControlEvents:UIControlEventTouchDown];
	[tableFooter addSubview:learnMoreButton];
	
	tableView.tableFooterView = tableFooter;
	
	
	// Fields
	self.usernameField = [self createFormField];
	self.passwordField = [self createFormField];
	passwordField.secureTextEntry = YES;
	self.confirmPasswordField = [self createFormField];
	confirmPasswordField.secureTextEntry = YES;
	NSString *currentUsername = [prefs objectForKey:@"ReadItLaterUsername"];
	NSString *currentPassword = [prefs objectForKey:@"ReadItLaterPassword"];
	self.usernameField.text = currentUsername ? currentUsername : @"";
	self.passwordField.text = currentPassword ? currentPassword : @"";
	
	
	// Allow for rotation
	
	tableView.autoresizesSubviews = YES;
	tableView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
	
	
	
	// Notify when keyboard is shown/hidden
	[[NSNotificationCenter defaultCenter] addObserver:self
											 selector:@selector(keyboardWasShown:)
												 name:UIKeyboardDidShowNotification object:nil];
	
	[[NSNotificationCenter defaultCenter] addObserver:self
											 selector:@selector(keyboardWasHidden:)
												 name:UIKeyboardDidHideNotification object:nil];
	
	
}


-(void)changeToSignupFinishedScreen {
	
	setupFinished = YES;
	
	// Change the toolbar
	UIBarButtonItem *doneBtn = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(cancelSetup)];
	[self.navigationItem setLeftBarButtonItem:doneBtn];
	[self.navigationItem setRightBarButtonItem:nil];
	[self.navigationItem setTitleView:nil];
	[doneBtn release];
	
	// Change the body text
	setupText.text = @"You now have an account.  You can access it with the Read It Later iPhone app or online at readitlaterlist.com.";
	
	// Hide the table rows
	[tableView reloadData];
	
	// Change the action button
	[learnMoreButton setTitle:@"Email me my login" forState:UIControlStateNormal];
	
}


// -- UITableView Implementation -- //

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

// Customize the number of rows in the table view.
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
	if (setupFinished) { return 0; }
	if (viewTypeControl.selectedSegmentIndex == -1) { viewTypeControl.selectedSegmentIndex = 0; }
	if (viewTypeControl.selectedSegmentIndex == 0) { return 2; }
	if (viewTypeControl.selectedSegmentIndex == 1) { return 3; }
	return 0;
}


// Customize the appearance of table view cells.
- (UITableViewCell *)tableView:(UITableView *)thisTableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
	
    static NSString *CellIdentifier = @"Cell";
	
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[[UITableViewCell alloc] initWithFrame:CGRectZero reuseIdentifier:CellIdentifier] autorelease];
		cell.selectionStyle = UITableViewCellSelectionStyleNone;
    }
	
	NSString *label;
	if (indexPath.row == 0) {
		label = @"Username:";
		[cell addSubview:usernameField];
		cell.accessoryView = usernameField;
	} else if (indexPath.row == 1) {
		label = @"Password:";
		cell.accessoryView = passwordField;
	} else if (indexPath.row == 2) {
		label = @"Confirm Pass:";
		cell.accessoryView = confirmPasswordField;
	}
	
	[cell setText:label];
	
    return cell;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
	return @"Read It Later Setup";
}



// Button actions

-(void)setupViewChanged {
	[activeField resignFirstResponder];
	usernameField.text = @"";
	passwordField.text = @"";
	confirmPasswordField.text = @"";
	[tableView reloadData];
}
-(void)cancelSetup {
	pendingUrl = nil;
	pendingTitle = nil;
	[delegate remove];
}
-(void)saveSetup {
	
	[activeField resignFirstResponder];
	[delegate showMessage:@"" loading:YES];
	
	if (viewTypeControl.selectedSegmentIndex == 0) { 
		
		// Login
		[ReadItLater authWithUsername:usernameField.text password:passwordField.text delegate:self];
		
	} else if (viewTypeControl.selectedSegmentIndex == 1) {
		
		// Signup
		
		if (passwordField.text.length == 0) {
			[delegate showMessage:@"Please enter a password" loading:NO];
			[delegate showSpinnerCancelButton];
		} else if (![passwordField.text isEqualToString:confirmPasswordField.text]) {
			[delegate showMessage:@"The passwords you entered do not match" loading:NO];
			[delegate showSpinnerCancelButton];
		} else {
			[ReadItLater signupWithUsername:usernameField.text password:passwordField.text delegate:self];
		}
		
	}
	
}
-(void)learnMore {
	NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
	
	NSString *urlStr;
	if (setupFinished)
	{
		urlStr = [NSString stringWithFormat:@"mailto:?subject=Read It Later Account&body=Username:%@\\nPassword:%@\\nhttp://readitlaterlist.com", [prefs objectForKey:@"ReadItLaterUsername"], [prefs objectForKey:@"ReadItLaterPassword"]];
	} else
	{
		urlStr = @"http://readitlaterlist.com/iphone/?a=1";
	}
	
	[[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlStr]];
}


// --- //

-(UITextField *)createFormField {
	UITextField *textField = [[UITextField alloc] initWithFrame:CGRectMake(0, 0, 150, 27)];
	textField.textColor = [UIColor darkGrayColor];
	textField.borderStyle = UITextBorderStyleNone;
	textField.adjustsFontSizeToFitWidth = YES;
	textField.minimumFontSize = 11;
	textField.delegate = self;
	textField.clearsOnBeginEditing = YES;
	textField.autocorrectionType = UITextAutocorrectionTypeNo;
	textField.enablesReturnKeyAutomatically = NO;
	return textField;
}



// -- UIKeyboard Delegate -- //


- (void)keyboardWasShown:(NSNotification*)aNotification {	
	
	if (keyboardShown) return;
	
    NSDictionary* info = [aNotification userInfo];
	
    // Get the size of the keyboard.
    NSValue* aValue = [info objectForKey:UIKeyboardBoundsUserInfoKey];
    CGSize keyboardSize = [aValue CGRectValue].size;
	
    // Scroll the active text field into view.
    CGRect textFieldRect = [[activeField superview] frame];
	
	CGRect viewFrame = [tableView frame];
	viewFrame.size.height -= keyboardSize.height;
	tableView.frame = viewFrame;
	[tableView scrollRectToVisible:textFieldRect animated:YES];
	
	keyboardShown = YES;
	
}

- (void)keyboardWasHidden:(NSNotification*)aNotification {
	
    NSDictionary* info = [aNotification userInfo];
	
    // Get the size of the keyboard.
    NSValue* aValue = [info objectForKey:UIKeyboardBoundsUserInfoKey];
    CGSize keyboardSize = [aValue CGRectValue].size;
	
    // Reset the height of the scroll view to its original value
	CGRect viewFrame = [tableView frame];
	viewFrame.size.height += keyboardSize.height;
	tableView.frame = viewFrame;
	
    keyboardShown = NO;
	
}
- (void)textFieldDidBeginEditing:(UITextField *)textField {
	self.activeField = textField;
}
- (void)textFieldDidEndEditing:(UITextField *)textField {
	self.activeField = textField;
}
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
	[textField resignFirstResponder];
	return YES;
}
- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
	int maxLength = 12 + ([string isEqualToString:@"\n"] ? 1 : 0);
	
	if (textField.text.length >= maxLength && range.length == 0)
		return NO;
	return YES;
}


//

/*
 -(void)viewDidDisappear:(BOOL)animated {
 [super viewDidDisappear:animated];
 [delegate removeTheController];
 } */



- (void)dealloc {
    [super dealloc];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    // We support everything on iPads and 3 on iPhones
    // FIXME: Read from the plist our supported interfaces, do not hardcode
    if(UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
        return YES;
    } else {
        return( interfaceOrientation == UIInterfaceOrientationLandscapeLeft
               || interfaceOrientation == UIInterfaceOrientationLandscapeRight
               || interfaceOrientation == UIInterfaceOrientationPortrait);
    }
}

@end

