const test = require("node:test");
const assert = require("node:assert/strict");
const {
    validateEvent,
    validateAttendee,
    validateEnrollmentCount,
    checkForDuplicateEnrollment,
    validateCheckIn,
} = require("../eventService");

test.describe("validateEvent Unit Tests", () => {
    test("Testing if validateEvent returns an error if event is an invalid type", () => {
        assert.throws(() => validateEvent(null), { name: "TypeError" });
        assert.throws(() => validateEvent(123), { name: "TypeError" });
        assert.throws(() => validateEvent(["abc"]), { name: "TypeError" });
    });

    test("Testing if validateEvent returns an error if event name is an invalid", () => {
        assert.throws(() => validateEvent({ name: null, date: "2026-02-25", capacity: 50 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: 123, date: "2026-02-25", capacity: 50 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: ["abc"], date: "2026-02-25", capacity: 50 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "     ", date: "2026-02-25", capacity: 50 }), {
            name: "TypeError",
        });
    });

    test("Testing if validateEvent returns an error for an invalid date format", () => {
        assert.throws(() => validateEvent({ name: "Royal Gala", date: null, capacity: 50 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: 123, capacity: 50 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: ["abc"], capacity: 50 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "    ", capacity: 50 }), {
            name: "TypeError",
        });
    });

    test("Testing if validateEvent returns an error for an invalid date numerically", () => {
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-02-50", capacity: 50 }), {
            name: "Error",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-13-12", capacity: 50 }), {
            name: "Error",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "3000-12-12", capacity: 50 }), {
            name: "Error",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "invalid-date", capacity: 50 }), {
            name: "Error",
        });
    });

    test("Testing if validateEvent returns an error for an invalid capacity value", () => {
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: null }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: -1 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: 1.5 }), {
            name: "TypeError",
        });
        assert.throws(() => validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: "50" }), {
            name: "TypeError",
        });
    });

    test("Testing if validateEvent will not throw an error with a valid event", () => {
        assert.strictEqual(validateEvent({ name: "Royal Gala", date: "2026-04-12", capacity: 50 }), undefined);
    });
});

test.describe("validateAttendee Unit Tests", () => {
    test("Testing if validateAttendee returns an error if event is an invalid type", () => {
        assert.throws(() => validateAttendee(null), { name: "TypeError" });
        assert.throws(() => validateAttendee(123), { name: "TypeError" });
        assert.throws(() => validateAttendee(["abc"]), { name: "TypeError" });
    });

    test("Testing if validateAttendee returns an error if attendee name is invalid", () => {
        assert.throws(() => validateAttendee({ name: null, email: "jdoe@example.com" }), { name: "TypeError" });
        assert.throws(() => validateAttendee({ name: 123, email: "jdoe@example.com" }), { name: "TypeError" });
        assert.throws(() => validateAttendee({ name: ["abc"], email: "jdoe@example.com" }), { name: "TypeError" });
        assert.throws(() => validateAttendee({ name: "    ", email: "jdoe@example.com" }), { name: "TypeError" });
    });

    test("Testing if validateAttendee returns an error if attendee email is an invalid type", () => {
        assert.throws(() => validateAttendee({ name: "John Doe", email: null }), { name: "TypeError" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: 123 }), { name: "TypeError" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: ["abc"] }), { name: "TypeError" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "     " }), { name: "TypeError" });
    });

    test("Testing if validateAttendee returns an error if attendee email is an invalid email", () => {
        assert.throws(() => validateAttendee({ name: "John Doe", email: "@." }), { name: "Error" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "!!!@!!!.!!!" }), { name: "Error" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "jdoe@%%%.%%%" }), { name: "Error" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "%%%@example.%%%" }), { name: "Error" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "%%%@%%%.com" }), { name: "Error" });
        assert.throws(() => validateAttendee({ name: "John Doe", email: "jdoe@example.c" }), { name: "Error" });
    });

    test("Testing if validateAttendee will not throw an error for a valid attendee", () => {
        assert.strictEqual(validateAttendee({ name: "John Doe", email: "jdoe@example.com" }), undefined);
    });
});

test.describe("validateEnrollmentCount Unit Tests", () => {
    test("Testing validateEnrollmentCount to ensure that event capacity cannot be invalid types", () => {
        assert.throws(() => validateEnrollmentCount(null, 10), { name: "TypeError" });
        assert.throws(() => validateEnrollmentCount("20", 10), { name: "TypeError" });
        assert.throws(() => validateEnrollmentCount(20.5, 10), { name: "TypeError" });
    });

    test("Testing validateEnrollmentCount to ensure that attendee count cannot be invalid types", () => {
        assert.throws(() => validateEnrollmentCount(20, null), { name: "TypeError" });
        assert.throws(() => validateEnrollmentCount(20, "10"), { name: "TypeError" });
        assert.throws(() => validateEnrollmentCount(20, 10.5), { name: "TypeError" });
    });

    test("Testing validateEnrollmentCount to ensure that attendees cannot be enrolled past capacity", () => {
        assert.throws(() => validateEnrollmentCount(10, 10), { name: "Error" });
        assert.throws(() => validateEnrollmentCount(10, 20), { name: "Error" });
    });

    test("Testing validateEnrollmentCount to ensure it does not throw an error if capacity has not been reached", () => {
        assert.strictEqual(validateEnrollmentCount(10, 5), undefined);
    });
});

test.describe("checkForDuplicateEnrollment Unit Tests", () => {
    test("Testing checkForDuplicateEnrollment fails if there already is an existing enrollment", () => {
        assert.throws(() => checkForDuplicateEnrollment({ event_id: 1, attendee_id: 1, checked_in: false }), {
            name: "Error",
        });
    });

    test("Testing checkForDuplicateEnrollment passes if there is not an existing enrollment", () => {
        assert.strictEqual(checkForDuplicateEnrollment(null), undefined);
    });
});

test.describe("validateCheckIn Unit Tests", () => {
    test("Testing validateCheckIn if checked_in value provided is invalid", () => {
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: null }), {
            name: "RangeError",
        });
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: -1 }), {
            name: "RangeError",
        });
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: 3 }), {
            name: "RangeError",
        });
    });

    test("Testing validateCheckIn if checked_in value provided is true or 1", () => {
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: 1 }), {
            name: "Error",
        });
        assert.throws(() => validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: true }), {
            name: "Error",
        });
    });

    test("Testing validateCheckIn passes if there is not an existing enrollment", () => {
        assert.strictEqual(validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: 0 }), undefined);
        assert.strictEqual(validateCheckIn({ event_id: 1, attendee_id: 1, checked_in: false }), undefined);
    });
});
