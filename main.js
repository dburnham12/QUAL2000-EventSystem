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
    addEventData(db);

    // Get user input using await
    let userPrompt;

    console.log("Welome to the event system!");

    do {
        console.log("==== Main Menu ====");
        console.log("Please select and option:");
        console.log("1: Add an event");
        console.log("2: List Events");
        console.log("3: Add an attendee");
        console.log("4: List all attendees");
        console.log("5: Enroll an attendee");
        console.log("6: Check in attendee");
        console.log("7: Get Event Report");
        console.log("8: Exit the program");
        userPrompt = await prompt("What is your selection?: ");

        if (userPrompt === "1") {
            const namePrompt = await prompt("Please enter an event name: ");
            const datePrompt = await prompt("Please enter a date (format YYYY-MM-DD): ");
            const capacityPrompt = await prompt("Please enter a capacity: ");

            try {
                await createEvent(db, { name: namePrompt, date: datePrompt, capacity: Number(capacityPrompt) });
            } catch (error) {
                console.log("==== Cannot create event ====");
                console.log(error.message);
            }
        } else if (userPrompt === "2") {
            console.log("==== List Events ====");
            const events = await getEventList(db);

            if (!events.length) {
                console.log("There are no listed events");
            }
            events.forEach((event) => {
                console.log(
                    `ID: ${event.id} | Name: ${event.name} | Date: ${event.date} | Capacity: ${event.capacity}`,
                );
            });
        } else if (userPrompt === "3") {
            const namePrompt = await prompt("Please enter an attendee name: ");
            const emailPrompt = await prompt("Please enter the attendees email address: ");

            try {
                await createAttendee(db, { name: namePrompt, email: emailPrompt });
            } catch (error) {
                console.log("==== Cannot create attendee ====");
                console.log(error.message);
            }
        } else if (userPrompt === "4") {
            console.log("==== List Attendees ====");
            const attendees = await getAllAttendeesList(db);
            if (!attendees.length) {
                console.log("There are no listed attendees");
            }
            attendees.forEach((attendee) => {
                console.log(`ID: ${attendee.id} | Name: ${attendee.name} | Email: ${attendee.email}`);
            });
        } else if (userPrompt === "5") {
            console.log("==== Enroll Attendee ====");
            const enrollEventName = await prompt("Please enter an event name: ");
            const enrollAttendeeEmail = await prompt("Please enter an attendee email: ");

            try {
                await enrollAttendee(db, enrollEventName, enrollAttendeeEmail);
            } catch (error) {
                console.log("==== Cannot enroll attendee ====");
                console.log(error.message);
            }
        } else if (userPrompt === "6") {
            console.log("==== Check In Attendee ====");
            const enrollEventName = await prompt("Please enter an event name: ");
            const enrollAttendeeEmail = await prompt("Please enter an attendee email: ");

            try {
                await checkInAttendee(db, enrollEventName, enrollAttendeeEmail);
            } catch (error) {
                console.log("==== Cannot check in attendee ====");
                console.log(error.message);
            }
        } else if (userPrompt === "7") {
            console.log("==== Printing Event Report ====");
            const report = await getEventReport(db);
            report.forEach((reportSection) => {
                console.log(`==== ${reportSection.name} ====`);
                console.log(
                    `Total Attendees: ${reportSection.totalAttendees}/${reportSection.capacity} | Total Checked In: ${reportSection.totalCheckedIn}/${reportSection.totalAttendees}`,
                );
                console.log("== Checked in attendees ==");
                if (!reportSection.checkedInAttendees.length) {
                    console.log("No attendees checked in for this event");
                } else {
                    reportSection.checkedInAttendees.forEach((attendee) =>
                        console.log(`Name: ${attendee.name} | Email: ${attendee.email}`),
                    );
                }
            });
        }
        await prompt("Press enter to continue...");
    } while (userPrompt !== "8");

    // Close the readline interface
    rl.close();

    await closeDb(db);
};

const addEventData = async (db) => {
    await createEvent(db, { name: "Royal Gala", date: "2026-05-22", capacity: 50 });
    await createEvent(db, { name: "Fun Function", date: "2026-06-25", capacity: 30 });
    await createEvent(db, { name: "Cool Convergence", date: "2027-02-28", capacity: 20 });

    await createAttendee(db, { name: "John Doe", email: "jodoe@gmail.com" });
    await createAttendee(db, { name: "John Doe", email: "jodoe@example.com" });
    await createAttendee(db, { name: "Jane Doe", email: "jadoe@gmail.com" });

    await enrollAttendee(db, "Royal Gala", "jodoe@gmail.com");
    await enrollAttendee(db, "Royal Gala", "jodoe@example.com");
    await enrollAttendee(db, "Fun Function", "jodoe@gmail.com");

    await checkInAttendee(db, "Royal Gala", "jodoe@gmail.com");
};

// Call the main async function
main();
