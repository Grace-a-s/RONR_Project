import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const MOTION_FILE = join(process.cwd(), "netlify", "functions", "motion.json");

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

// Helper to read motion data from file
async function readMotionData() {
  try {
    const data = await readFile(MOTION_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading motion file:", error);
    return { motion_list: [] };
  }
}

// Helper to write motion data to file
async function writeMotionData(data) {
  try {
    await writeFile(MOTION_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing motion file:", error);
    return false;
  }
}

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const motionId = pathParts[pathParts.length - 1];

    // GET all motions or single motion
    if (req.method === "GET") {
      const data = await readMotionData();

      // Get specific motion by ID
      if (motionId && motionId !== "motionAPI") {
        const motion = data.motion_list.find(
          (m) => m.id === parseInt(motionId)
        );
        if (!motion) {
          return new Response(JSON.stringify({ error: "Motion not found" }), {
            status: 404,
            headers,
          });
        }
        return new Response(JSON.stringify(motion), { status: 200, headers });
      }

      // Get all motions
      return new Response(JSON.stringify(data), { status: 200, headers });
    }

    // POST - Create new motion
    if (req.method === "POST") {
      const newMotion = await req.json();
      const data = await readMotionData();

      // Generate new ID
      const maxId =
        data.motion_list.length > 0
          ? Math.max(...data.motion_list.map((m) => m.id))
          : -1;

      const motion = {
        id: maxId + 1,
        title: newMotion.title,
        description: newMotion.description,
        debate_list: [],
        timestamp: Date.now(),
        author: newMotion.author || "Anonymous",
        second: false,
      };

      data.motion_list.push(motion);
      const success = await writeMotionData(data);

      if (!success) {
        return new Response(
          JSON.stringify({ error: "Failed to save motion" }),
          {
            status: 500,
            headers,
          }
        );
      }

      return new Response(JSON.stringify(motion), { status: 201, headers });
    }

    // PUT - Update existing motion
    if (req.method === "PUT") {
      const updates = await req.json();
      const data = await readMotionData();

      const index = data.motion_list.findIndex(
        (m) => m.id === parseInt(motionId)
      );
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Motion not found" }), {
          status: 404,
          headers,
        });
      }

      // Update motion with new data
      data.motion_list[index] = {
        ...data.motion_list[index],
        ...updates,
      };

      const success = await writeMotionData(data);

      if (!success) {
        return new Response(
          JSON.stringify({ error: "Failed to update motion" }),
          {
            status: 500,
            headers,
          }
        );
      }

      return new Response(JSON.stringify(data.motion_list[index]), {
        status: 200,
        headers,
      });
    }

    // Method not allowed
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
};
