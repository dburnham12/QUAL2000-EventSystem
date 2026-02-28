const {
    createEvent,
    getEventList,
    createAttendee,
    getAllAttendeesList,
    enrollAttendee,
    checkInAttendee,
    getEventReport,
} = require("./eventService");
const { createDb, initSchema, closeDb } = require("./db");

const readline = require("readline");

// Reference
// https://stackoverflow.com/questions/61394928/get-user-input-through-node-js-console
// How to get user input through the javascript console, used as the basis to create
// the console application.

// Create an interface for input and output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompt = (userPrompt) => {
    return new Promise((resolve) => {
        rl.question(userPrompt, (answer) => {
            resolve(answer);
        });
    });
};

// Main async function
const main = async () => {
    const db = createDb();
    await initSchema(db);

    // Throw some test even data into the database
    await addEventData(db);

    // Get user input using await
    let userPrompt;

    console.log("Welcome to the event system!");

    do {
        // Display the selection menu
        console.log("==== Main Menu ====");
        console.log("Please select an option:");
        console.log("1: Add an event");
        console.log("2: List Events");
        console.log("3: Add an attendee");
        console.log("4: List all attendees");
        console.log("5: Enroll an attendee");
        console.log("6: Check in attendee");
        console.log("7: Get Event Report");
        console.log("8: Exit the program");
        userPrompt = await prompt("What is your selection?: ");

        // Switch statement to control the terminal application
        switch (userPrompt) {
            case "1":
                await createEventPrompt(db);
                break;
            case "2":
                await viewAllEvents(db);
                break;
            case "3":
                await createAttendeePrompt(db);
                break;
            case "4":
                await viewAllAttendees(db);
                break;
            case "5":
                await enrollAttendeePrompt(db);
                break;
            case "6":
                await checkInAttendeePrompt(db);
                break;
            case "7":
                await printAndExportReport(db);
                break;
            case "8":
                console.log("Exiting program...");
                break;
            default:
                console.log("That is not a valid selection");
                await prompt("Press enter to continue...");
        }
    } while (userPrompt !== "8");

    // Close the readline interface
    rl.close();

    // Close the database
    await closeDb(db);
};

// Function used to create an event
const createEventPrompt = async (db) => {
    // Display header and prompt the user for required information
    console.log("==== Create Event ====");
    const namePrompt = await prompt("Please enter an event name: ");
    const datePrompt = await prompt("Please enter a date (format YYYY-MM-DD): ");
    const capacityPrompt = await prompt("Please enter a capacity: ");

    try {
        // Attempt to add the event to the db
        await createEvent(db, { name: namePrompt, date: datePrompt, capacity: Number(capacityPrompt) });
        console.log(`Event ${namePrompt} created successfully`);
    } catch (error) {
        // If an error is found display an appropriate error message
        console.log("==== Cannot Create Event ====");
        console.log(error.message);
    }
    await prompt("Press enter to continue...");
};

// Function used to view all events
const viewAllEvents = async (db) => {
    // Display the header and get events from the db
    console.log("==== List Events ====");
    const events = await getEventList(db);

    // If there are no events display an appropriate message
    if (!events.length) {
        console.log("There are no listed events");
    }

    // If there are events display them
    events.forEach((event) => {
        console.log(`ID: ${event.id} | Name: ${event.name} | Date: ${event.date} | Capacity: ${event.capacity}`);
    });
    await prompt("Press enter to continue...");
};

// Function used to create an attendee
const createAttendeePrompt = async (db) => {
    // Display header and prompt the user for required information
    console.log("==== Create Attendee ====");
    const namePrompt = await prompt("Please enter an attendee name: ");
    const emailPrompt = await prompt("Please enter the attendees email address: ");

    try {
        // Attempt to add the attendee to the db
        await createAttendee(db, { name: namePrompt, email: emailPrompt });
        console.log(`Attendee ${namePrompt} created successfully`);
    } catch (error) {
        // If there is an error display an appropriate message
        console.log("==== Cannot Create Attendee ====");
        console.log(error.message);
    }
    await prompt("Press enter to continue...");
};

// Function to view all attendees in the db
const viewAllAttendees = async (db) => {
    // Display header and get list of attendees from the db
    console.log("==== List Attendees ====");
    const attendees = await getAllAttendeesList(db);

    // If there are no attendees display an appropriate message
    if (!attendees.length) {
        console.log("There are no listed attendees");
    }

    // If there are attendees display them
    attendees.forEach((attendee) => {
        console.log(`ID: ${attendee.id} | Name: ${attendee.name} | Email: ${attendee.email}`);
    });
    await prompt("Press enter to continue...");
};

// Function used to enroll an attendee into an event
const enrollAttendeePrompt = async (db) => {
    // Display header and prompt user for required information
    console.log("==== Enroll Attendee ====");
    const enrollEventName = await prompt("Please enter an event name: ");
    const enrollAttendeeEmail = await prompt("Please enter an attendee email: ");

    try {
        // Attempt to create the enrollment
        await enrollAttendee(db, enrollEventName, enrollAttendeeEmail);
        console.log(`Attendee with email ${enrollAttendeeEmail} successfully enrolled in event ${enrollEventName}`);
    } catch (error) {
        // If there is an error display an appropriate message
        console.log("==== Cannot Enroll Attendee ====");
        console.log(error.message);
    }
    await prompt("Press enter to continue...");
};

// Function used to check in an attendee
const checkInAttendeePrompt = async (db) => {
    // Prompt the user for the required information
    console.log("==== Check In Attendee ====");
    const checkInEventName = await prompt("Please enter an event name: ");
    const checkInAttendeeEmail = await prompt("Please enter an attendee email: ");

    try {
        // Attempt to check in the attendee
        await checkInAttendee(db, checkInEventName, checkInAttendeeEmail);
        console.log(
            `Attendee with email ${checkInAttendeeEmail} successfully check in to in event ${checkInEventName}`,
        );
    } catch (error) {
        // Display an appropriate error message on failure
        console.log("==== Cannot Check In Attendee ====");
        console.log(error.message);
    }
    await prompt("Press enter to continue...");
};

// Function used to print report to console and export it as a json file
const printAndExportReport = async (db) => {
    // Display header and run function that pulls info from db and exports the report
    console.log("==== Printing Event Report ====");
    const report = await getEventReport(db);

    // Go through each entry
    report.forEach((reportSection) => {
        // Display the name of the event
        console.log(`==== ${reportSection.name} ====`);
        // Display counts
        console.log(
            `Total Attendees: ${reportSection.totalAttendees}/${reportSection.capacity} | Total Checked In: ${reportSection.totalCheckedIn}/${reportSection.totalAttendees}`,
        );
        // Display the list of checked in attendees
        console.log("== Checked In Attendees ==");
        if (!reportSection.checkedInAttendees.length) {
            // If there are no attendees display this
            console.log("No attendees checked in for this event");
        } else {
            // If there are attendees display them
            reportSection.checkedInAttendees.forEach((attendee) =>
                console.log(`Name: ${attendee.name} | Email: ${attendee.email}`),
            );
        }
    });
    await prompt("Press enter to continue...");
};

// Add a small amount of sample data when the program starts
const addEventData = async (db) => {
    // Add some events
    await createEvent(db, { name: "Royal Gala", date: "2026-05-22", capacity: 50 });
    await createEvent(db, { name: "Fun Function", date: "2026-06-25", capacity: 30 });
    await createEvent(db, { name: "Cool Convergence", date: "2027-02-28", capacity: 20 });

    // Add some attendees
    await createAttendee(db, { name: "John Doe", email: "jodoe@gmail.com" });
    await createAttendee(db, { name: "John Doe", email: "jodoe@example.com" });
    await createAttendee(db, { name: "Jane Doe", email: "jadoe@gmail.com" });

    // Enroll some attendees
    await enrollAttendee(db, "Royal Gala", "jodoe@gmail.com");
    await enrollAttendee(db, "Royal Gala", "jodoe@example.com");
    await enrollAttendee(db, "Fun Function", "jodoe@gmail.com");

    // Check in some attendees
    await checkInAttendee(db, "Royal Gala", "jodoe@gmail.com");
};

// Call the main async function
main();
