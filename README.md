# Event System

This application is a simple event attendance system developed using Node.js.

It allows for:

- Creation of events
- Creation of event attendees
- Attendee enrollment
- Attendee check-in
- Full event report generation (either console-based or through a generated `report.json` file)

## Design Decision: Event Names

For simplicity, event names are unique. This allows events to be searched and referenced using their names instead of only using an ID. Enforcing uniqueness at the database level also helps maintain data integrity and simplifies validation and testing by preventing ambiguous event selection as some events may be named the same and occur on the same date.

## Running the Application

The application is a terminal/console-based program.

To get a copy of the code on your machine, run the following command in a terminal:

`git clone https://github.com/dburnham12/QUAL2000-EventSystem.git`

This will download the repository to your local machine.

### Install dependencies

Run:

`npm install`

This installs the required dependencies in the `node_modules` folder.

### Start the application

Run:

`node main.js`

This launches the application.

## Application Console

The application uses a simple menu-driven command-line interface navigated through numeric input.

After selecting an option, the program prompts the user for the required information to complete the action.

If an error occurs, an error message is displayed indicating that the operation has failed.

## Testing

To run the test suite:

`node --test`

OR

`npm test`

This executes all automated tests.

## Continuous Integration

This repository uses GitHub Actions for automated testing. The workflow runs automatically on pushes and pull requests to the `main` branch. It installs dependencies and executes all tests. If any test fails, the workflow fails.
