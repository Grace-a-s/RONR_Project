const fs = require("fs").promises;
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "netlify_data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}
}

function fileForCommittee(committeeId) {
  if (!committeeId) return path.join(DATA_DIR, "motions.json");
  return path.join(DATA_DIR, `motions_${committeeId}.json`);
}

async function readMotions(committeeId) {
  try {
    const file = fileForCommittee(committeeId);
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

async function writeMotions(committeeId, data) {
  await ensureDataDir();
  const file = fileForCommittee(committeeId);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

exports.handler = async function (event) {
  const { httpMethod, queryStringParameters } = event;
  const q = queryStringParameters || {};
  const committeeId = q.committeeId;
  const motionId = q.motionId;

  if (httpMethod === "GET") {
    const motions = await readMotions(committeeId);
    if (motionId) {
      const found = motions.find((m) => String(m.id) === String(motionId));
      if (!found)
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Not found" }),
        };
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motion: found }),
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motion_list: motions }),
    };
  }

  if (httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { committeeId: bodyCid, title, description, author } = body;
      const cid = bodyCid || committeeId;
      const motions = await readMotions(cid);
      const newMotion = {
        id: String(Date.now()) + Math.floor(Math.random() * 1000),
        title: title || "Untitled",
        description: description || "",
        debate_list: [],
        timestamp: Date.now(),
        author: author || "anonymous",
        second: false,
      };
      motions.push(newMotion);
      await writeMotions(cid, motions);
      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motion: newMotion }),
      };
    } catch (e) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: String(e) }),
      };
    }
  }

  if (httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { committeeId: bodyCid, motion } = body;
      if (!motion || !motion.id)
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Motion and id required" }),
        };
      const cid = bodyCid || committeeId;
      const motions = await readMotions(cid);
      const idx = motions.findIndex((m) => String(m.id) === String(motion.id));
      if (idx !== -1) motions[idx] = motion;
      else motions.push(motion);
      await writeMotions(cid, motions);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motion }),
      };
    } catch (e) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: String(e) }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: { "Content-Type": "application/json" },
    body: "Method Not Allowed",
  };
};
