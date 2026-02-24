# Event System

This application is a simple event attendance system developed using Node.js.

It allows for:

- The creation of events
- The creation of event attendees
- Attendee enrollment
- Attendee check in
- Full event report generation (either console based or through created report.json file)

## Running The application

The application is a simple terminal/console based application.

To set up dependencies first run:

`npm install`

This will install the node_modules folder

Next to run the application in the terminal simply run:

`node main.js`

This will launch the application.

## Application Console

The application console uses a simple command line structure which is navigated by using number input.

Upon entering a number the program will provide a series of prompts that must be filled in order to process that action.

If an error occurs the error message will be displayed to the console indicating that the operation has failed.

## Testing

To test the system simply run the command:

`node --test`

OR

`npm test`

This will launch the test suites.

## Continuous Integration

This repository uses GitHub actions to control the workflow of testing. This workflow runs automatically on push and pull requests to the main branch. It installs dependencies and executes all tests. If any test fails, the workflow fails.
