// imports
const test = require("node:test");
const assert = require("node:assert/strict");
const { createDb, initSchema, closeDb } = require("../db");
const { createEvent, createAttendee, enrollAttendee, checkInAttendee, getEventReport } = require("../eventService");
const { getEventByName, getAttendeeByEmail, getEnrollmentByIds } = require("../eventRepo");

//Global db variable
let db;

// createEvent test suites
test.describe("Event service createEvent integration testing", () => {
    // create a database before each test
    test.beforeEach(async () => {
        db = createDb();
        await initSchema(db);
    });

    // remove and wipe clean the memory from any database after each test
    test.afterEach(async () => {
        await closeDb(db);
    });

    // Smoke test to add a new event
    test("createEvent can add a new event to the DB", async () => {
        // Create a new event
        const newEvent = await createEvent(db, { name: "Royal Gala", date: "2026-04-10", capacity: 50 });
        assert.ok(newEvent.id); // This test is passable and does not throw an error

        // find the newly created event
        const found = await getEventByName(db, newEvent.name);
        assert.deepStrictEqual(found, newEvent); // check if the event entered === the event on the DB
    });

    test("createEvent trims white space from event name", async () => {
        const newEvent = await createEvent(db, { name: "   Royal Gala   ", date: "2026-04-10", capacity: 50 });
        assert.strictEqual(newEvent.name, "Royal Gala");
    });

    test("createEvent trims white space from event date", async () => {
        const newEvent = await createEvent(db, { name: "Royal Gala", date: "   2026-04-10   ", capacity: 50 });
        assert.strictEqual(newEvent.date, "2026-04-10");
    });

    test("createEvent can add multiple events and retrieve them correctly", async () => {
        const newEventA = await createEvent(db, { name: "Royal Gala", date: "2026-04-10", capacity: 50 });
        const newEventB = await createEvent(db, { name: "Fun Function", date: "2026-05-12", capacity: 30 });

        const eventCheckA = await getEventByName(db, "Royal Gala");
        const eventCheckB = await getEventByName(db, "Fun Function");

        assert.deepStrictEqual(newEventA, eventCheckA);
        assert.deepStrictEqual(newEventB, eventCheckB);
    });

    test("createEvent throws an error on duplicate event creation", async () => {
        await createEvent(db, { name: "Royal Gala", date: "2026-04-10", capacity: 50 });
        await assert.rejects(() => createEvent(db, { name: "Royal Gala", date: "2026-04-10", capacity: 50 }), {
            code: "SQLITE_CONSTRAINT",
        });
    });
});

// createAttendee test suites
test.describe("Event service createAttendee integration testing", () => {
    // create a database before each test
    test.beforeEach(async () => {
        db = createDb();
        await initSchema(db);
    });

    // remove and wipe clean the memory from any database after each test
    test.afterEach(async () => {
        await closeDb(db);
    });

    // Smoke test to add a new attendee
    test("createAttendee can add a new attendee to the DB", async () => {
        // Create a new attendee
        const newAttendee = await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        assert.ok(newAttendee.id); // This test is passable and does not throw an error

        // find the newly created event
        const found = await getAttendeeByEmail(db, newAttendee.email);
        assert.deepStrictEqual(found, newAttendee); // check if the attendee entered === the attendee on the DB
    });

    test("createAttendee trims white space from attendee name", async () => {
        const newAttendee = await createAttendee(db, { name: "   John Doe    ", email: "jdoe@gmail.com" });
        assert.strictEqual(newAttendee.name, "John Doe");
    });

    test("createAttendee trims white space from attendee email", async () => {
        const newAttendee = await createAttendee(db, { name: "John Doe", email: "   jdoe@gmail.com   " });
        assert.strictEqual(newAttendee.email, "jdoe@gmail.com");
    });

    test("createAttendee normalizes attendee email to lower case", async () => {
        const newAttendee = await createAttendee(db, { name: "John Doe", email: "jDoE@GmAiL.CoM" });
        assert.strictEqual(newAttendee.email, "jdoe@gmail.com");
    });

    test("createAttendee can add multiple attendees and retrieve them correctly", async () => {
        const newAttendeeA = await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        const newAttendeeB = await createAttendee(db, { name: "Dylan Burnham", email: "dburnham@gmail.com" });

        const attendeeCheckA = await getAttendeeByEmail(db, "jdoe@gmail.com");
        const attendeeCheckB = await getAttendeeByEmail(db, "dburnham@gmail.com");

        assert.deepStrictEqual(newAttendeeA, attendeeCheckA);
        assert.deepStrictEqual(newAttendeeB, attendeeCheckB);
    });

    test("createAttendee throws an error on duplicate attendee creation", async () => {
        await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        await assert.rejects(() => createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" }), {
            code: "SQLITE_CONSTRAINT",
        });
    });
});

// enrollAttendee test suites
test.describe("Event service enrollAttendee integration testing", () => {
    // create a database before each test
    test.beforeEach(async () => {
        db = createDb();
        await initSchema(db);
    });

    // remove and wipe clean the memory from any database after each test
    test.afterEach(async () => {
        await closeDb(db);
    });

    // Smoke test to add a new attendee
    test("enrollAttendee can add a new enrollment to the DB", async () => {
        // Create a new attendee
        const newAttendee = await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        assert.ok(newAttendee.id); // This test is passable and does not throw an error

        // Create a new event
        const newEvent = await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });
        assert.ok(newEvent.id); // This test is passable and does not throw an error

        // Create a new enrollment
        const newEnrollment = await enrollAttendee(db, "Royal Gala", "jdoe@gmail.com");

        // find the newly created enrollement
        const found = await getEnrollmentByIds(db, newEvent.id, newAttendee.id);
        assert.deepStrictEqual(found, newEnrollment); // check if the enrollment entered === the enrollment on the DB
    });

    test("enrollAttendee cannot add a new enrollment to the DB if there is no event with that name", async () => {
        await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });

        await assert.rejects(() => enrollAttendee(db, "Royal Gala", "jdoe@gmail.com"), { name: "Error" });
    });

    test("enrollAttendee cannot add a new enrollment to the DB if there is not attendee with matching email", async () => {
        await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });

        await assert.rejects(() => enrollAttendee(db, "Royal Gala", "jdoe@gmail.com"), { name: "Error" });
    });

    test("enrollAttendee cannot add duplicate enrollments to the DB", async () => {
        await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });

        await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });

        await enrollAttendee(db, "Royal Gala", "jdoe@gmail.com");
        await assert.rejects(() => enrollAttendee(db, "Royal Gala", "jdoe@gmail.com"), { name: "Error" });
    });

    test("enrollAttendee cannot add enrollments past capacity to the DB", async () => {
        await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        await createAttendee(db, { name: "Dylan Burnham", email: "dburnham@gmail.com" });

        await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 1 });

        await enrollAttendee(db, "Royal Gala", "jdoe@gmail.com");
        await assert.rejects(() => enrollAttendee(db, "Royal Gala", "dburnham@gmail.com"), { name: "Error" });
    });
});

// checkInAttendee test suites
test.describe("Event service checkInAttendee integration testing", () => {
    // create a database before each test
    test.beforeEach(async () => {
        db = createDb();
        await initSchema(db);
    });

    // remove and wipe clean the memory from any database after each test
    test.afterEach(async () => {
        await closeDb(db);
    });

    test("checkInAttendee can check in an enrolled attendee in the DB", async () => {
        // Create a new attendee
        const newAttendee = await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        assert.ok(newAttendee.id); // This test is passable and does not throw an error

        // Create a new event
        const newEvent = await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });
        assert.ok(newEvent.id); // This test is passable and does not throw an error

        // Create a new enrollment
        await enrollAttendee(db, "Royal Gala", "jdoe@gmail.com");

        // Create a new check in
        const newCheckIn = await checkInAttendee(db, "Royal Gala", "jdoe@gmail.com");

        // find the newly created check in
        const found = await getEnrollmentByIds(db, newEvent.id, newAttendee.id);
        assert.deepStrictEqual(found, newCheckIn); // check if the enrollment entered === the enrollment on the DB
    });

    test("checkInAttendee throws an error if event does not exist", async () => {
        await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });

        await assert.rejects(() => checkInAttendee(db, "Royal Gala", "jdoe@gmail.com"), { name: "Error" });
    });

    test("checkInAttendee throws an error if attendee does not exist", async () => {
        await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });

        await assert.rejects(() => checkInAttendee(db, "Royal Gala", "jdoe@gmail.com"), { name: "Error" });
    });

    test("checkInAttendee throws an error if attendee is already checked in to the event", async () => {
        await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });

        await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });

        await enrollAttendee(db, "Royal Gala", "jdoe@gmail.com");

        await checkInAttendee(db, "Royal Gala", "jdoe@gmail.com");
        await assert.rejects(() => checkInAttendee(db, "Royal Gala", "jdoe@gmail.com"), { name: "Error" });
    });
});

// getEventReport test suites
test.describe("Event service getEventReport integration testing", () => {
    // create a database before each test
    test.beforeEach(async () => {
        db = createDb();
        await initSchema(db);
    });

    // remove and wipe clean the memory from any database after each test
    test.afterEach(async () => {
        await closeDb(db);
    });

    test("getEventReport can generate a correct report", async () => {
        // Create a new attendee
        const newAttendee = await createAttendee(db, { name: "John Doe", email: "jdoe@gmail.com" });
        assert.ok(newAttendee.id); // This test is passable and does not throw an error

        // Create a new attendee
        const newAttendeeA = await createAttendee(db, { name: "Dylan Burnham", email: "dburnham@gmail.com" });
        assert.ok(newAttendeeA.id); // This test is passable and does not throw an error

        // Create a new event
        const newEventA = await createEvent(db, { name: "Royal Gala", date: "2026-04-12", capacity: 50 });
        assert.ok(newEventA.id); // This test is passable and does not throw an error

        // Create a new event
        const newEventB = await createEvent(db, { name: "Fun Function", date: "2026-05-15", capacity: 30 });
        assert.ok(newEventB.id); // This test is passable and does not throw an error

        // Create new enrollments
        await enrollAttendee(db, "Royal Gala", "jdoe@gmail.com");
        await enrollAttendee(db, "Fun Function", "jdoe@gmail.com");
        await enrollAttendee(db, "Royal Gala", "dburnham@gmail.com");

        // Create a new check in
        await checkInAttendee(db, "Royal Gala", "jdoe@gmail.com");

        const report = await getEventReport(db);

        assert.deepStrictEqual(report, [
            {
                name: newEventA.name,
                capacity: newEventA.capacity,
                totalAttendees: 2,
                totalCheckedIn: 1,
                checkedInAttendees: [{ name: "John Doe", email: "jdoe@gmail.com" }],
            },
            {
                name: newEventB.name,
                capacity: newEventB.capacity,
                totalAttendees: 1,
                totalCheckedIn: 0,
                checkedInAttendees: [],
            },
        ]);
    });

    test("getEventReport can generate a blank report", async () => {
        const report = await getEventReport(db);

        assert.deepStrictEqual(report, []);
    });
});
