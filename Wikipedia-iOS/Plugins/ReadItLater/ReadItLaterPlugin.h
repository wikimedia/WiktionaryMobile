//
//  ReadItLaterPlugin.h
//  ReadItLaterPlugin
//
//  Created by Tommy-Carlos Williams (tommy@devgeeks.org) on 16/03/12.
//  Copyright (c) 2012 Tommy-Carlos Williams. All rights reserved.
//  MIT Licensed
//

#ifdef PHONEGAP_FRAMEWORK
#import <PhoneGap/PGPlugin.h>
#else
#import "PGPlugin.h"
#endif

@interface ReadItLaterPlugin : PGPlugin {
	NSString* callbackId;
}

@property (nonatomic, copy) NSString* callbackId;

- (void)saveToReadItLater:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
