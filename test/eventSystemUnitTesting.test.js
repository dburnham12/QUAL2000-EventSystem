const test = require("node:test");
const assert = require("node:assert/strict");
const {
    validateEvent,
    validateAttendee,
    validateEnrollmentCount,
    checkForDuplicateEnrollment,
    validateCheckIn,
} = require("../eventService");

// Unit tests for event service

// Unit tests for validateEvent function
test.describe("validateEvent Unit Tests", () => {
    test("Testing if validateEvent returns an error if event is an invalid type", () => {
        assert.throws(() => validateEvent(null), { message: "Event must be an object" });
        assert.throws(() => validateEvent(123), { message: "Event must be an object" });
        assert.throws(() => validateEvent(["abc"]), { message: "Event must be an object" });
    });

    test("Testing if validateEvent returns an error if event name is an invalid", () => {
        assert.throws(() => validateEvent({ name: null, date: "2026-02-25", capacity: 50 }), {
            message: "Event name must be a non empty string",
        });
        assert.throws(() => validateEvent({ name: 123, date: "2026-02-25", capacity: 50 }), {
            message: "Event name must be a non empty string",
        });
        assert.throws(() => validateEvent({ name: ["abc"], date: "2026-02-25", capacity: 50 }), {
            message: "Event name must be a non empty string",
        });
        assert.throws(() => validateEvent({ name: "     ", date: "2026-02-25", capacity: 50 }), {
            message: "Event name must be a non empty string",
        });
    });

    test("Testing if validateEvent returns an error for an invalid date format", () => {
        assert.throws(() => validateEvent({ name: "Royal Gala", date: null, capacity: 50 }), {
            message: "Event date must be a non empty string of format YYYY-MM-DD",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: 123, capacity: 50 }), {
            message: "Event date must be a non empty string of format YYYY-MM-DD",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: ["abc"], capacity: 50 }), {
            message: "Event date must be a non empty string of format YYYY-MM-DD",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "    ", capacity: 50 }), {
            message: "Event date must be a non empty string of format YYYY-MM-DD",
        });
    });

    test("Testing if validateEvent returns an error for an invalid date numerically", () => {
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-02-50", capacity: 50 }), {
            message: "Event date is invalid",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-13-12", capacity: 50 }), {
            message: "Event date is invalid",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "3000-12-12", capacity: 50 }), {
            message: "Event date is invalid",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "invalid-date", capacity: 50 }), {
            message: "Event date is invalid",
        });
    });

    test("Testing if validateEvent returns an error for an invalid capacity value", () => {
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: null }), {
            message: "Event capacity must be a positive integer",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: -1 }), {
            message: "Event capacity must be a positive integer",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: 1.5 }), {
            message: "Event capacity must be a positive integer",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: "50" }), {
            message: "Event capacity must be a positive integer",
        });
    });

    test("Testing if validateEvent will not throw an error with a valid event", () => {
        assert.strictEqual(validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: 50 }), undefined);
    });
});

// Unit tests for validateAttendee function
test.describe("validateAttendee Unit Tests", () => {
    test("Testing if validateAttendee returns an error if event is an invalid type", () => {
        assert.throws(() => validateAttendee(null), { message: "Attendee must be an object" });
        assert.throws(() => validateAttendee(123), { message: "Attendee must be an object" });
        assert.throws(() => validateAttendee(["abc"]), { message: "Attendee must be an object" });
    });

    test("Testing if validateAttendee returns an error if attendee name is invalid", () => {
        assert.throws(() => validateAttendee({ name: null, email: "jdoe@example.com" }), {
            message: "Attendee name must be a non empty string",
        });
        assert.throws(() => validateAttendee({ name: 123, email: "jdoe@example.com" }), {
            message: "Attendee name must be a non empty string",
        });
        assert.throws(() => validateAttendee({ name: ["abc"], email: "jdoe@example.com" }), {
            message: "Attendee name must be a non empty string",
        });
        assert.throws(() => validateAttendee({ name: "    ", email: "jdoe@example.com" }), {
            message: "Attendee name must be a non empty string",
        });
    });

    test("Testing if validateAttendee returns an error if attendee email is an invalid type", () => {
        assert.throws(() => validateAttendee({ name: "John Doe", email: null }), {
            message: "Attendee email must be a non empty string",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: 123 }), {
            message: "Attendee email must be a non empty string",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: ["abc"] }), {
            message: "Attendee email must be a non empty string",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "     " }), {
            message: "Attendee email must be a non empty string",
        });
    });

    test("Testing if validateAttendee returns an error if attendee email is an invalid email", () => {
        assert.throws(() => validateAttendee({ name: "John Doe", email: "@." }), {
            message: "Attendee email is invalid",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "!!!@!!!.!!!" }), {
            message: "Attendee email is invalid",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "jdoe@%%%.%%%" }), {
            message: "Attendee email is invalid",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "%%%@example.%%%" }), {
            message: "Attendee email is invalid",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "%%%@%%%.com" }), {
            message: "Attendee email is invalid",
        });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "jdoe@example.c" }), {
            message: "Attendee email is invalid",
        });
    });

    test("Testing if validateAttendee will not throw an error for a valid attendee", () => {
        assert.strictEqual(validateAttendee({ name: "John Doe", email: "jdoe@example.com" }), undefined);
    });
});

// Unit tests for validateEnrollmentCount function
test.describe("validateEnrollmentCount Unit Tests", () => {
    test("Testing validateEnrollmentCount to ensure that event capacity cannot be invalid types", () => {
        assert.throws(() => validateEnrollmentCount(null, 10), { message: "Max attendees must be an integer" });
        assert.throws(() => validateEnrollmentCount("20", 10), { message: "Max attendees must be an integer" });
        assert.throws(() => validateEnrollmentCount(20.5, 10), { message: "Max attendees must be an integer" });
    });

    test("Testing validateEnrollmentCount to ensure that attendee count cannot be invalid types", () => {
        assert.throws(() => validateEnrollmentCount(20, null), { message: "Number of attendees must be an integer" });
        assert.throws(() => validateEnrollmentCount(20, "10"), { message: "Number of attendees must be an integer" });
        assert.throws(() => validateEnrollmentCount(20, 10.5), { message: "Number of attendees must be an integer" });
    });

    test("Testing validateEnrollmentCount to ensure that attendees cannot be enrolled past capacity", () => {
        assert.throws(() => validateEnrollmentCount(10, 10), {
            message: "Cannot enroll attendee, maximum attendance reached",
        });
        assert.throws(() => validateEnrollmentCount(10, 20), {
            message: "Cannot enroll attendee, maximum attendance reached",
        });
    });

    test("Testing validateEnrollmentCount to ensure it does not throw an error if capacity has not been reached", () => {
        assert.strictEqual(validateEnrollmentCount(10, 5), undefined);
    });
});

// Unit test for checkForDuplicateEnrollment function
test.describe("checkForDuplicateEnrollment Unit Tests", () => {
    test("Testing checkForDuplicateEnrollment fails if there already is an existing enrollment", () => {
        assert.throws(() => checkForDuplicateEnrollment({ event_id: 1, attendee_id: 1, checked_in: false }), {
            message: "Duplicate enrollment cannot exist",
        });
    });

    test("Testing checkForDuplicateEnrollment passes if there is not an existing enrollment", () => {
        assert.strictEqual(checkForDuplicateEnrollment(null), undefined);
    });
});

// Unit tests for validateCheckIn function
test.describe("validateCheckIn Unit Tests", () => {
    test("Testing validateCheckIn if checked_in value provided is invalid", () => {
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: null }), {
            message: "Attendee checked in value must be a value of 1 or 0 (true or false)",
        });
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: -1 }), {
            message: "Attendee checked in value must be a value of 1 or 0 (true or false)",
        });
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: 3 }), {
            message: "Attendee checked in value must be a value of 1 or 0 (true or false)",
        });
    });

    test("Testing validateCheckIn if checked_in value provided is true or 1", () => {
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: 1 }), {
            message: "Attendee already checked in, cannot check in attendee twice",
        });
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: true }), {
            message: "Attendee already checked in, cannot check in attendee twice",
        });
    });

    test("Testing validateCheckIn passes if there is not an existing enrollment", () => {
        assert.strictEqual(validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: 0 }), undefined);
        assert.strictEqual(validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: false }), undefined);
    });
});
