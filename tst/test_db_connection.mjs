/*
Simple script for testing database connection. Run from root directory using node
*/

import { connectDatabase } from "../netlify/functions/db.mjs";

try {
    await connectDatabase();
    console.log('Connected successfully.');
    process.exit(0);
    } catch (err) {
    console.error('Connection failed.');
    if (err && err.message) console.error('Error message:', err.message);
    if (err && err.codeName) console.error('Error codeName:', err.codeName);

    process.exit(1);
};