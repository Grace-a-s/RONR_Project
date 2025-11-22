import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const usernameRaw = process.env.MONGO_DB_USERNAME;
const passwordRaw = process.env.MONGO_DB_PASSWORD;
const cluster = process.env.MONGO_DB_CLUSTER;
const appName = process.env.MONGO_DB_APPNAME;

const missing = [];
if (!usernameRaw) missing.push('MONGO_DB_USERNAME');
if (!passwordRaw) missing.push('MONGO_DB_PASSWORD');
if (!cluster) missing.push('MONGO_DB_CLUSTER');
if (!appName) missing.push('MONGO_DB_APPNAME');

if (missing.length) {
  console.error('Missing Mongo environment variables:', missing.join(', '));
  process.exit(1);
}

// Usernames and passwords with special characters must be encoded
const encodedUsername = encodeURIComponent(usernameRaw);
const encodedPassword = encodeURIComponent(passwordRaw);

const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${cluster}/?appName=${appName}`;

let conn = null;

export async function connectDatabase() {
  if (conn) return conn;

  conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  return conn;
}