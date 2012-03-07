GETTING STARTED:

1. Setup your development environment
2. Setup the project
3. Pull down external dependencies via command line by running

	make remotes


ENVIRONMENT SETUP

1. Follow Steps 1 & 2 from the instructions found on the <a href="http://www.phonegap.com/start" target="_blank">PhoneGap.com Getting Started Page</a> to get all the necessary software for contributing to this project.

CHECKING OUT THE SOURCE CODE

1. Create your own fork of the <a href="https://github.com/wikimedia/WikipediaMobile" target="_blank">Wikipedia</a> code.
2. Clone your fork onto your computer.
                            
SETTING UP THE PROJECT WITHOUT ECLIPSE

There is a highly useful tutorial @
http://www.mediawiki.org/wiki/Mobile/PhoneGap/Tutorial#Setup

SETTING UP THE PROJECT IN ECLIPSE

1. In Eclipse choose to import a project by going to File (in the menu bar) -> Import.
2. Select General -> Existing Projects into Workspace	
3. Choose Select Root Directory radio button and then click the Browse button next to the right. 
4. Navigate to the directory where you cloned the source code and then click the Open button on the bottom of the dialog.
5. Click the Finish button.

The project should now be setup in Eclipse.

ANT CONFIGURATION

Make sure to modify the sdk.dir variable in the local.properties file so that it points to the location where the android sdk is installed on your computer.

BUILDING FOR PLAYBOOK

- Grab the SDK from <a href="https://bdsc.webapps.blackberry.com/html5/download/sdk">here</a>.
- Update the project.properties in the blackberry folder, you will need signing keys to load onto a device
- run:

    ant playbook load-device


FAQ:
                    
Q. I'm seeing an error that says "DroidGap cannot be resolved to a type", how do I fix it?

A. You will need to add the PhoneGap library to your project, by following these steps to get the file.

1. Download <a href="https://github.com/phonegap/phonegap" target="_blank">PhoneGap</a>
2. Unzip the PhoneGap files.  
3. Copy Android/phonegap-1.1.0.jar into the libs folder of your project.
4. To add the phonegap-1.1.0.jar into your project, right click your Eclipse project and select Properties. 
5. Select Java Build Path, click on the Libraries tab and then click the Add JARs button.
6. Browse to libs/phonegap-1.1.0.jar and choose to add it.

CONTRIBUTING
Please ensure you read STYLE_GUIDELINES before making any contribution to this project!
