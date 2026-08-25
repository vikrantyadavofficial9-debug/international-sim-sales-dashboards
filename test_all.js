const http = require("http");
const app = require("./server");
const salesHandler = require("./api/sales");

async function runTests() {
  console.log("--- TEST SUITE: International SIM Sales Dashboard ---");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Test api/sales.js handler directly (simulating Vercel Serverless Function)
  console.log("\n1. Testing api/sales.js Vercel serverless function:");
  
  // Test single date
  let req = { method: "GET", query: { report_date: "2026-06-30" } };
  let statusCode = 0;
  let jsonOutput = null;
  let headers = {};
  let res = {
    setHeader: (k, v) => { headers[k] = v; },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonOutput = data;
      return res;
    },
    end: () => res
  };

  salesHandler(req, res);
  assert(statusCode === 200, "api/sales.js returns 200 for 2026-06-30");
  assert(jsonOutput && jsonOutput.top_country === "Saudi Arabia", "api/sales.js returns Saudi Arabia for 2026-06-30");
  assert(jsonOutput && jsonOutput.total_units_sold === 1400, "api/sales.js returns 1400 units sold");

  // Test all dates
  req = { method: "GET", query: {} };
  salesHandler(req, res);
  assert(statusCode === 200, "api/sales.js returns 200 when no report_date provided (summary mode)");
  assert(jsonOutput && jsonOutput.dates && jsonOutput.dates.length === 4, "api/sales.js returns all 4 dates in summary mode");

  // Test invalid date format
  req = { method: "GET", query: { report_date: "invalid-date" } };
  salesHandler(req, res);
  assert(statusCode === 400, "api/sales.js returns 400 for invalid date format");

  // Test not found date
  req = { method: "GET", query: { report_date: "2026-01-01" } };
  salesHandler(req, res);
  assert(statusCode === 404, "api/sales.js returns 404 for unknown date");

  // 2. Test Express server HTTP endpoints
  console.log("\n2. Testing Express server HTTP endpoints on localhost:");
  const server = app.listen(3001);

  async function fetchHttp(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:3001${path}`, (res) => {
        let body = "";
        res.on("data", (chunk) => body += chunk);
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body, json: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body, json: null });
          }
        });
      }).on("error", reject);
    });
  }

  try {
    // Test HTML root
    const rootRes = await fetchHttp("/");
    assert(rootRes.status === 200, "GET / returns 200 OK");
    assert(rootRes.body.includes("International SIM Sales Dashboard"), "GET / serves index.html dashboard markup");

    // Test API Thailand
    const thRes = await fetchHttp("/api/sales?report_date=2026-06-27");
    assert(thRes.status === 200, "GET /api/sales?report_date=2026-06-27 returns 200");
    assert(thRes.json.top_country === "Thailand", "GET /api/sales for 2026-06-27 is Thailand");

    // Test API Singapore
    const sgRes = await fetchHttp("/api/sales?report_date=2026-06-28");
    assert(sgRes.status === 200, "GET /api/sales?report_date=2026-06-28 returns 200");
    assert(sgRes.json.top_country === "Singapore", "GET /api/sales for 2026-06-28 is Singapore");

    // Test API UAE
    const uaeRes = await fetchHttp("/api/sales?report_date=2026-06-29");
    assert(uaeRes.status === 200, "GET /api/sales?report_date=2026-06-29 returns 200");
    assert(uaeRes.json.top_country === "UAE", "GET /api/sales for 2026-06-29 is UAE");

    // Test All
    const allRes = await fetchHttp("/api/sales");
    assert(allRes.status === 200, "GET /api/sales returns 200");
    assert(allRes.json.dates.length === 4, "GET /api/sales returns 4 dates summary");

  } finally {
    server.close();
  }

  console.log(`\n================================`);
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
