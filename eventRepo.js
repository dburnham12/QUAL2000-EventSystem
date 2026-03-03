const { run, get, all } = require("./db");

// Function used to insert an event to the db
const addEvent = async (db, event) => {
    // Set up the insertion and run it
    const result = await run(db, "INSERT INTO events (name, date, capacity) VALUES (?, ?, ?)", [
        event.name,
        event.date,
        event.capacity,
    ]);

    // Return the newly created event
    return {
        id: result.lastID,
        name: event.name,
        date: event.date,
        capacity: event.capacity,
    };
};

// Function used to get all events from the db
const getEvents = async (db) => {
    return await all(db, "SELECT * FROM events ORDER BY id");
};

// Function used to return an event by name
const getEventByName = async (db, name) => {
    return await get(db, "SELECT * FROM events WHERE name = ?", [name]);
};

// Function used to add an attendee to the db
const addAttendee = async (db, attendee) => {
    // Set up and insert the attendee to the db
    const result = await run(db, "INSERT INTO attendees (name, email) VALUES (?, ?)", [attendee.name, attendee.email]);

    // return the newly created attendee
    return {
        id: result.lastID,
        name: attendee.name,
        email: attendee.email,
    };
};

// Function used to get all attendees
const getAllAttendees = async (db) => {
    return await all(db, "SELECT * FROM attendees ORDER BY id");
};

// Function used to get an attendee by their email
const getAttendeeByEmail = async (db, email) => {
    return await get(db, "SELECT * FROM attendees WHERE email = ?", [email]);
};

// Function used to add an event attendee (enrollment)
const addEventAttendee = async (db, eventId, attendeeId) => {
    await run(db, "INSERT INTO event_attendees (event_id, attendee_id) VALUES (?, ?)", [eventId, attendeeId]);
    const result = await getEnrollmentByIds(db, eventId, attendeeId);
    return result;
};

// Function used to get an enrollment based off of its respective ids
const getEnrollmentByIds = async (db, eventId, attendeeId) => {
    return await get(db, "SELECT * FROM event_attendees WHERE event_id = ? AND attendee_id = ?", [eventId, attendeeId]);
};

// Function used to update checked in status to checked in
const confirmAttendeeCheckin = async (db, eventId, attendeeId) => {
    await run(db, "UPDATE event_attendees SET checked_in = 1 WHERE event_id = ? AND attendee_id = ?", [
        eventId,
        attendeeId,
    ]);
    const result = await getEnrollmentByIds(db, eventId, attendeeId);
    return result;
};

// function used to return all event info
const getAllEventInfo = async (db) => {
    const result = await all(
        db,
        `SELECT e.id AS event_id, e.name AS event_name, e.date, e.capacity,
                a.id AS attendee_id, a.name AS attendee_name, a.email, ea.checked_in
        FROM events e 
        JOIN event_attendees ea ON e.id = ea.event_id
        JOIN attendees a ON ea.attendee_id = a.id
        ORDER BY e.id, a.id`,
    );

    return result;
};

const countEventAttendees = async (db, id) => {
    const result = await get(
        db,
        "SELECT COUNT(attendee_id) AS attendee_count FROM event_attendees WHERE event_id = ?",
        [id],
    );

    return result.attendee_count;
};

module.exports = {
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
};
