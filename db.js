const sqlite3 = require("sqlite3");
// Creates and returns a new in-memory database connection
const createDb = () => {
    const db = new sqlite3.Database(":memory:");
    db.exec("PRAGMA foreign_keys = ON");
    return db;
};

// Executes a SQL statement with optional parameters
const run = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
};

// Retrieves a single row from the database
const get = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Retrieves all rows from the database for the given query
const all = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Initializes the database schema
const initSchema = async (db) => {
    await run(
        db,
        `CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date DATE NOT NULL,
      capacity INTEGER NOT NULL,
      UNIQUE(name)
    )`,
    );

    await run(
        db,
        `CREATE TABLE attendees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      UNIQUE(email)
    )`,
    );

    await run(
        db,
        `CREATE TABLE event_attendees (
      event_id INTEGER NOT NULL,
      attendee_id INTEGER NOT NULL,
      checked_in BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (event_id, attendee_id),
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY(attendee_id) REFERENCES attendees(id) ON DELETE CASCADE
    )`,
    );
};

// Closes the database connection
const closeDb = (db) => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Exports the database utility functions for use in other modules
module.exports = {
    createDb,
    initSchema,
    run,
    get,
    all,
    closeDb,
};
