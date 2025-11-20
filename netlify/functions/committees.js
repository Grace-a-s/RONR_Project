const fs = require("fs").promises;
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "netlify_data");
const FILE = path.join(DATA_DIR, "committees.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    console.log("ensureDataDir");
  }
}

async function readCommittees() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.log("readCommittees");
    return [];
  }
}

async function writeCommittees(data) {
  await ensureDataDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}

exports.handler = async function (event) {
  const { httpMethod } = event;

  if (httpMethod === "GET") {
    const committees = await readCommittees();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ committees }),
    };
  }

  if (httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { name, description } = body;
      if (!name) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Name required" }),
        };
      }
      const committees = await readCommittees();
      const newCommittee = {
        id: String(Date.now()),
        name: String(name).trim(),
        description: String(description || "").trim(),
        createdAt: Date.now(),
      };
      committees.push(newCommittee);
      await writeCommittees(committees);
      return {
        statusCode: 201,
        body: JSON.stringify({ committee: newCommittee }),
      };
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
