# Wikipedia Mobile

## Getting started

1. Setup your development environment
2. Setup the project
3. Run `git submodule update --init` to grab our submodule dependencies (MobileFrontend)

## Environment setup

1. Follow Steps 1 & 2 from the instructions found on the <a href="http://www.phonegap.com/start" target="_blank">PhoneGap.com Getting Started Page</a> to get all the necessary software for contributing to this project.

### Checking out the source code

1. Create your own fork of the <a href="https://github.com/wikimedia/WikipediaMobile" target="_blank">Wikipedia</a> code.
2. Clone your fork onto your computer.
                            
### Setting up the project

#### in web browser
You can run the app within your desktop browser under certain situations. Safari works out of the box. You can also use Google Chrome by passing it the `--disable-web-security` flag. Navigate to `index.html` to start the app. 

Note: Running in the web browser is currently not a supported environment. Things might break

#### without Eclipse

There is a highly useful tutorial @
http://www.mediawiki.org/wiki/Mobile/PhoneGap/Tutorial#Setup

#### with Eclipse

1. In Eclipse choose to import a project by going to File (in the menu bar) -> Import.
2. Select General -> Existing Projects into Workspace	
3. Choose Select Root Directory radio button and then click the Browse button next to the right. 
4. Navigate to the directory where you cloned the source code and then click the Open button on the bottom of the dialog.
5. Click the Finish button.

The project should now be setup in Eclipse.

### ANT configuration

Make sure to modify the sdk.dir variable in the local.properties file so that it points to the location where the android sdk is installed on your computer.

### Building for BlackBerry PlayBook

- Grab the SDK from <a href="https://bdsc.webapps.blackberry.com/html5/download/sdk">here</a>.
- Update the project.properties in the blackberry folder, you will need signing keys to load onto a device
- run: `ant playbook load-device`

## FAQ
                    
Q. I can't seem to find PhoneGap 1.4.1! Where can I download it?

A: Right [here][phonegap-1-4-1-download]

## Contributing
Please ensure you read STYLE_GUIDELINES before making any contribution to this project!

[phonegap-1-4-1-download]: https://nodeload.github.com/phonegap/phonegap/zipball/1.4.1
