const {
    addEvent,
    getEvents,
    getEventByName,
    addAttendee,
    getAllAttendees,
    getAttendeeByEmail,
    addEventAttendee,
    getEnrollmentByIds,
    getAllEventInfo,
    confirmAttendeeCheckin,
    countEventAttendees,
} = require("./eventRepo");

// Reference
// https://www.javaspring.net/blog/how-to-write-data-to-a-json-file-using-javascript/#google_vignette
// Used to learn how to write to json files.

// File system setup
const fs = require("fs").promises;
const path = require("path");

// Used to validate an event based on the provided event object
const validateEvent = (event) => {
    // Is the event an object
    if (!event || typeof event !== "object" || Array.isArray(event)) {
        throw new TypeError("Event must be an object");
    }
    // Is the name valid
    if (!event.name || typeof event.name !== "string" || event.name.trim() === "") {
        throw new TypeError("Event name must be a non empty string");
    }
    // Is the date a valid type
    if (!event.date || typeof event.date !== "string" || event.date.trim() === "") {
        throw new TypeError("Event date must be a non empty string of format YYYY-MM-DD");
    }
    // Is the date of the correct format
    const dateRegex = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(event.date.trim())) {
        throw new Error("Event date is invalid");
    }
    // Is the capacity a valid integer
    if (!event.capacity || !Number.isInteger(event.capacity) || event.capacity <= 0) {
        throw new TypeError("Event capacity must be a positive integer");
    }
};

// Function used to create an event in the event system
const createEvent = async (db, event) => {
    // First validate inpu
    validateEvent(event);
    // Then create the even in the db
    return await addEvent(db, {
        name: event.name.trim(),
        date: event.date.trim(),
        capacity: event.capacity,
    });
};

// Function to get all events listed in the db
const getEventList = async (db) => {
    return await getEvents(db);
};

// Function to validate an attendee based off of object input
const validateAttendee = (attendee) => {
    // Is attendee a valid object
    if (!attendee || typeof attendee !== "object" || Array.isArray(attendee)) {
        throw new TypeError("Attendee must be an object");
    }
    // Is the attendee name a valid string
    if (!attendee.name || typeof attendee.name !== "string" || attendee.name.trim() === "") {
        throw new TypeError("Attendee name must be a non empty string");
    }
    // Is the attendee email a valid string
    if (!attendee.email || typeof attendee.email !== "string" || attendee.email.trim() === "") {
        throw new TypeError("Attendee email must be a non empty string");
    }
    // Is the attendee email valid based on pattern recognition
    const emailRegex = /^[A-Za-z0-9+._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(attendee.email.trim())) {
        throw new Error("Attendee email is invalid");
    }
};

// Function to create an attendee
const createAttendee = async (db, attendee) => {
    // First validate the attendee object
    validateAttendee(attendee);
    // Then add the attendee to the db
    return await addAttendee(db, {
        name: attendee.name.trim(),
        email: attendee.email.trim().toLowerCase(),
    });
};

// Return all attendees that exist in the system
const getAllAttendeesList = async (db) => {
    return await getAllAttendees(db);
};

// Function used to validate and check if event is full
const validateEnrollmentCount = (maxAttendees, numberOfAttendees) => {
    // Is the capacity a valid integer
    if (!Number.isInteger(maxAttendees)) {
        throw new TypeError("Max attendees must be an integer");
    }
    // Is the number of attendees a valid integer
    if (!Number.isInteger(numberOfAttendees)) {
        throw new TypeError("Number of attendees must be an integer");
    }
    // Is the event full
    if (maxAttendees <= numberOfAttendees) {
        throw new Error("Cannot enroll attendee, maximum attendance reached");
    }
};

// Function used to check if an enrollment already exists
const checkForDuplicateEnrollment = (enrollment) => {
    // Check if the enrollment already exists
    if (enrollment) {
        throw new Error("Duplicate enrollment cannot exist");
    }
};

// Function used to enroll an attendee into an event using the event name and attendee email
const enrollAttendee = async (db, eventName, attendeeEmail) => {
    // Retrieve event from db
    const event = await getEventByName(db, eventName);
    // Check if the event was found
    if (!event) throw new Error("Event does not exist");
    // Make sure other validation is correct for the event
    validateEvent(event);
    // Count the event attendees
    const enrollmentCount = await countEventAttendees(db, event.id);
    // Make sure the values passed are valid and the event is not full
    validateEnrollmentCount(event.capacity, enrollmentCount);
    // Retrieve the attendee from the db
    const attendee = await getAttendeeByEmail(db, attendeeEmail);
    // Check if the attendee exists
    if (!attendee) throw new Error("Attendee does not exist");
    // Makes sure other validation is correct for the attendee
    validateAttendee(attendee);
    // Check if there is an enrollment already in the db
    const enrollment = await getEnrollmentByIds(db, event.id, attendee.id);
    // If so do not add the duplicate
    checkForDuplicateEnrollment(enrollment);
    // If all checks pass add the attendee
    return await addEventAttendee(db, event.id, attendee.id);
};

// Function used to check if an attendee has already been checked in
const validateCheckIn = (enrollment) => {
    // Check if checked in is a valid format
    if (
        enrollment.checked_in !== 1 &&
        enrollment.checked_in !== 0 &&
        enrollment.checked_in !== false &&
        enrollment.checked_in !== true
    ) {
        throw new RangeError("Attendee checked in value must be a value of 1 or 0 (true or false)");
    }
    // Check if the attendee is already checked in
    if (enrollment.checked_in === 1 || enrollment.checked_in === true) {
        throw new Error("Attendee already checked in, cannot check in attendee twice");
    }
};

// Function used to check in an attendee to an event based on event name and attendee email
const checkInAttendee = async (db, eventName, attendeeEmail) => {
    // First get the event
    const event = await getEventByName(db, eventName);
    // Check if the event was found
    if (!event) throw new Error("Event does not exist");
    // Sanity check to validate the event is of correct format
    validateEvent(event);
    // Get the attendee
    const attendee = await getAttendeeByEmail(db, attendeeEmail);
    // Check if the attendee was found
    if (!attendee) throw new Error("Attendee does not exist");
    // Sanity check to validate the attendee is of correct format
    validateAttendee(attendee);
    // Get the enrollment from the db
    const enrollment = await getEnrollmentByIds(db, event.id, attendee.id);
    // validate the enrollment
    if (!enrollment) throw new Error("Enrollment does not exist");
    validateCheckIn(enrollment);
    // If all checks passcheck in the attendee
    return await confirmAttendeeCheckin(db, event.id, attendee.id);
};

// Function to produce a report of all events in our db
const getEventReport = async (db) => {
    // First get the event info
    const events = await getEvents(db);
    const eventInfo = await getAllEventInfo(db);

    // Set up a result
    let result = [];
    for (const event of events) {
        // Find all results for the current event
        const currentEventInfo = eventInfo.filter((currentEvent) => {
            return currentEvent.event_id === event.id;
        });

        // Set upa list of checked in attendees
        let checkedInAttendees = [];
        // Push checked in attendees to list
        currentEventInfo.forEach((attendee) => {
            if (attendee.checked_in === 1) {
                checkedInAttendees.push({
                    name: attendee.attendee_name,
                    email: attendee.email,
                });
            }
        });

        // Find the amount of attendees at the event
        const totalAttendees = await countEventAttendees(db, event.id);

        // Add the row to the results
        result = [
            ...result,
            {
                name: event.name,
                capacity: event.capacity,
                totalAttendees,
                totalCheckedIn: checkedInAttendees.length,
                checkedInAttendees,
            },
        ];
    }

    // Write the report to a json file
    const filePath = path.resolve("./report.json");
    const reportData = JSON.stringify(result, null, 2);
    await fs.writeFile(filePath, reportData, "utf8");

    return result;
};

module.exports = {
    validateEvent,
    createEvent,
    getEventList,
    validateAttendee,
    createAttendee,
    getAllAttendeesList,
    validateEnrollmentCount,
    checkForDuplicateEnrollment,
    enrollAttendee,
    validateCheckIn,
    checkInAttendee,
    getEventReport,
};
