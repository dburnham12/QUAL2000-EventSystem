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

const fs = require("fs").promises;
const path = require("path");

const validateEvent = (event) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) {
        throw new TypeError("Event must be an object");
    }
    if (!event.name || typeof event.name !== "string" || event.name.trim() === "") {
        throw new TypeError("Event name must be a non empty string");
    }
    if (!event.date || typeof event.date !== "string" || event.date.trim() === "") {
        throw new TypeError("Event date must be a non empty string of format YYYY-MM-DD");
    }
    const dateRegex = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(event.date.trim())) {
        throw new Error("Event date is invalid");
    }
    if (!event.capacity || !Number.isInteger(event.capacity) || event.capacity <= 0) {
        throw new TypeError("Event capacity must be a positive integer");
    }
};

const createEvent = async (db, event) => {
    validateEvent(event);
    return await addEvent(db, {
        name: event.name.trim(),
        date: event.date.trim(),
        capacity: event.capacity,
    });
};

const getEventList = async (db) => {
    return await getEvents(db);
};

const validateAttendee = (attendee) => {
    if (!attendee || typeof attendee !== "object" || Array.isArray(attendee)) {
        throw new TypeError("Attendee must be an object");
    }
    if (!attendee.name || typeof attendee.name !== "string" || attendee.name.trim() === "") {
        throw new TypeError("Attendee name must be a non empty string");
    }
    if (!attendee.email || typeof attendee.email !== "string" || attendee.email.trim() === "") {
        throw new TypeError("Attendee email must be a non empty string");
    }
    const emailRegex = /^[A-Za-z0-9+._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(attendee.email.trim())) {
        throw new Error("Attendee email is invalid");
    }
};

const createAttendee = async (db, attendee) => {
    validateAttendee(attendee);
    return await addAttendee(db, {
        name: attendee.name.trim(),
        email: attendee.email.trim().toLowerCase(),
    });
};

const getAllAttendeesList = async (db) => {
    return await getAllAttendees(db);
};

const validateEnrollmentCount = (maxAttendees, numberOfAttendees) => {
    if (!Number.isInteger(maxAttendees)) {
        throw new TypeError("Max attendees must be an integer");
    }
    if (!Number.isInteger(numberOfAttendees)) {
        throw new TypeError("Number of attendees must be an integer");
    }
    if (maxAttendees <= numberOfAttendees) {
        throw new Error("Cannot enroll attendee, maximum attendance reached");
    }
};

const checkForDuplicateEnrollment = (enrollment) => {
    if (enrollment) {
        throw new Error("Duplicate enrollment cannot exist");
    }
};

const enrollAttendee = async (db, eventName, attendeeEmail) => {
    const event = await getEventByName(db, eventName);
    if (!event) throw new Error("Event does not exist");
    validateEvent(event);
    const enrollmentCount = await countEventAttendees(db, event.id);
    validateEnrollmentCount(event.capacity, enrollmentCount);
    const attendee = await getAttendeeByEmail(db, attendeeEmail);
    if (!attendee) throw new Error("Attendee does not exist");
    validateAttendee(attendee);
    const enrollment = await getEnrollmentByIds(db, event.id, attendee.id);
    checkForDuplicateEnrollment(enrollment);
    return await addEventAttendee(db, event.id, attendee.id);
};

const validateCheckIn = (enrollment) => {
    if (
        enrollment.checked_in !== 1 &&
        enrollment.checked_in !== 0 &&
        enrollment.checked_in !== false &&
        enrollment.checked_in !== true
    ) {
        throw new RangeError("Attendee checked in value must be a value of 1 or 0 (true or false)");
    }
    if (enrollment.checked_in === 1 || enrollment.checked_in === true) {
        throw new Error("Attendee already checked in, cannot check in attendee twice");
    }
};

const checkInAttendee = async (db, eventName, attendeeEmail) => {
    const event = await getEventByName(db, eventName);
    if (!event) throw new Error("Event does not exist");
    validateEvent(event);
    const attendee = await getAttendeeByEmail(db, attendeeEmail);
    if (!attendee) throw new Error("Attendee does not exist");
    validateAttendee(attendee);
    const enrollment = await getEnrollmentByIds(db, event.id, attendee.id);
    validateCheckIn(enrollment);
    return await confirmAttendeeCheckin(db, event.id, attendee.id);
};

const getEventReport = async (db) => {
    const events = await getEvents(db);
    const eventInfo = await getAllEventInfo(db);
    let result = [];
    for (const event of events) {
        const currentEventInfo = eventInfo.filter((currentEvent) => {
            return currentEvent.event_id === event.id;
        });

        let checkedInAttendees = [];
        currentEventInfo.forEach((attendee) => {
            if (attendee.checked_in === 1) {
                checkedInAttendees.push({
                    name: attendee.attendee_name,
                    email: attendee.email,
                });
            }
        });

        const totalAttendees = await countEventAttendees(db, event.id);

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
