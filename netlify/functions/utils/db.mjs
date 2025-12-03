import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const usernameRaw = process.env.MONGO_DB_USERNAME;
const passwordRaw = process.env.MONGO_DB_PASSWORD;
const cluster = process.env.MONGO_DB_CLUSTER;
const appName = process.env.MONGO_DB_APPNAME;

const missing = [];
if (!usernameRaw) missing.push("MONGO_DB_USERNAME");
if (!passwordRaw) missing.push("MONGO_DB_PASSWORD");
if (!cluster) missing.push("MONGO_DB_CLUSTER");
if (!appName) missing.push("MONGO_DB_APPNAME");

if (missing.length) {
  console.error("Missing Mongo environment variables:", missing.join(", "));
  throw new Error("Missing Mongo environment variables: " + missing.join(", "));
}

// Encode credentials for safe inclusion in the uri
const encodedUsername = encodeURIComponent(usernameRaw);
const encodedPassword = encodeURIComponent(passwordRaw);

// Use SRV connection string form (you already do)
const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${cluster}/?appName=${appName}`;

// Cached connection for warm function reuse
let conn = null;

/**
 * Sleep helper for backoff
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connect to MongoDB with retries and sensible timeouts.
 * Options:
 *   maxAttempts - how many connect attempts (default 3)
 *   serverSelectionTimeoutMS - time to wait for server selection (default 10s)
 *   connectTimeoutMS - socket connect timeout (default 10s)
 *   socketTimeoutMS - socket inactivity timeout (default 45s)
 *   maxPoolSize - connection pool size (default 10)
 */
export async function connectDatabase({
  maxAttempts = 3,
  serverSelectionTimeoutMS = 10000,
  connectTimeoutMS = 10000,
  socketTimeoutMS = 45000,
  maxPoolSize = 10,
} = {}) {
  // If we have an active connection, reuse it.
  if (conn && mongoose.connection && mongoose.connection.readyState === 1) {
    return conn;
  }

  const options = {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS,
    maxPoolSize,
    appName,
    // keepAlive is default behavior; you can enable explicitly if desired:
    // keepAlive: true,
  };

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      console.info(
        `Mongo: connect attempt ${attempt}/${maxAttempts} to ${cluster}`
      );
      conn = await mongoose.connect(uri, options);
      console.info("Mongo: connected");
      return conn;
    } catch (err) {
      console.error(
        `Mongo connect attempt ${attempt} failed:`,
        err && err.message ? err.message : err
      );
      if (attempt >= maxAttempts) {
        console.error("Mongo: all connection attempts failed");
        throw err;
      }
      const backoffMs = 300 * (attempt * attempt); // 300ms, 1200ms, 2700ms...
      console.info(`Mongo: retrying in ${backoffMs}ms`);
      await sleep(backoffMs);
    }
  }
}
