const http = require("http");

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const contentType = res.headers["content-type"] || "";
        const parsed = contentType.includes("application/json")
          ? tryParseJson(data)
          : data;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

function tryParseJson(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return s;
  }
}

async function probePorts() {
  const ports = [57100, 62461, 8888, 34567, 8880];
  for (const p of ports) {
    try {
      const res = await httpRequest({
        hostname: "127.0.0.1",
        port: p,
        path: "/.netlify/functions/committees",
        method: "GET",
        timeout: 2000,
      });
      if (res && res.statusCode && res.statusCode < 500)
        return `http://127.0.0.1:${p}`;
    } catch (e) {}
  }
  // try localhost without port (not likely)
  throw new Error(
    "No running Netlify functions found on common ports. Start `netlify dev` and retry."
  );
}

async function run() {
  try {
    const base = process.env.NETLIFY_DEV_URL || (await probePorts());
    console.log("Using functions base URL:", base);

    // GET committees
    console.log("\nGET /committees");
    let res = await httpRequest({
      hostname: "127.0.0.1",
      port: new URL(base).port,
      path: "/.netlify/functions/committees",
      method: "GET",
    });
    console.log("Status:", res.statusCode);
    console.log("Body:", JSON.stringify(res.body, null, 2));

    // POST create committee
    console.log("\nPOST /committees");
    const newCommittee = {
      name: "api-test-" + Date.now(),
      description: "created by script",
    };
    res = await httpRequest(
      {
        hostname: "127.0.0.1",
        port: new URL(base).port,
        path: "/.netlify/functions/committees",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      JSON.stringify(newCommittee)
    );
    console.log("Status:", res.statusCode);
    console.log("Body:", JSON.stringify(res.body, null, 2));
    const created = res.body && res.body.committee ? res.body.committee : null;

    // GET motions for that committee (should be empty)
    console.log("\nGET /motions?committeeId=...");
    const cid = created ? created.id : (res.body && res.body.id) || "";
    const motionsPath =
      "/.netlify/functions/motions?committeeId=" + encodeURIComponent(cid);
    res = await httpRequest({
      hostname: "127.0.0.1",
      port: new URL(base).port,
      path: motionsPath,
      method: "GET",
    });
    console.log("Status:", res.statusCode);
    console.log("Body:", JSON.stringify(res.body, null, 2));

    // POST a motion
    console.log("\nPOST /motions");
    const newMotion = {
      committeeId: cid,
      title: "Test Motion",
      description: "from api_test",
      author: "tester",
    };
    res = await httpRequest(
      {
        hostname: "127.0.0.1",
        port: new URL(base).port,
        path: "/.netlify/functions/motions",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      JSON.stringify(newMotion)
    );
    console.log("Status:", res.statusCode);
    console.log("Body:", JSON.stringify(res.body, null, 2));
    const createdMotion = res.body && res.body.motion ? res.body.motion : null;

    // GET the motion by id
    if (createdMotion) {
      console.log("\nGET /motions?committeeId=...&motionId=...");
      const mp =
        "/.netlify/functions/motions?committeeId=" +
        encodeURIComponent(cid) +
        "&motionId=" +
        encodeURIComponent(createdMotion.id);
      res = await httpRequest({
        hostname: "127.0.0.1",
        port: new URL(base).port,
        path: mp,
        method: "GET",
      });
      console.log("Status:", res.statusCode);
      console.log("Body:", JSON.stringify(res.body, null, 2));
    }

    console.log("\nAll tests finished.");
  } catch (e) {
    console.error("Test failed:", e.message || e);
    process.exitCode = 2;
  }
}

run();
