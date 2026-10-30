/* ==========================================================
   TechBridge Task Management API
   Node.js + Express
   ----------------------------------------------------------
   Endpoints
     GET  /api/health      Check that the server is running
     GET  /api/tasks       Get all tasks
     GET  /api/tasks/:id   Get one task
     PUT  /api/tasks/:id   Update a task's status
     POST /api/reset       Put the tasks back to their starting state (extra)

   Run it:   npm install   then   npm start
   Open:     http://localhost:3000/dashboard.html
   ========================================================== */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

/* ---------- SETTINGS ---------- */

const PORT = process.env.PORT || 3000;

// A small pause before every API answer. Real servers take a moment to reply,
// and this makes the dashboard's "Loading tasks..." message visible.
// Turn it off with:  DELAY_MS=0 npm start
const DELAY_MS = process.env.DELAY_MS !== undefined ? Number(process.env.DELAY_MS) : 400;

const DATA_FILE = path.join(__dirname, "data", "tasks.json");
const VALID_STATUSES = ["completed", "in-progress", "not-started"];

// The frontend folder. It sits next to "backend" in the project, or one level up
// when the website files live in the same folder as "backend" (like the GitHub repo).
const FRONTEND_DIR = fs.existsSync(path.join(__dirname, "..", "frontend"))
    ? path.join(__dirname, "..", "frontend")
    : path.join(__dirname, "..");

/* ---------- TASK DATA ---------- */

// Read the starting data from tasks.json. The tasks are then kept in memory,
// so changes last until the server stops. Restarting the server resets them.
function readTasksFromFile() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

let tasks = readTasksFromFile();

// Turn the ":id" part of a URL into a number. Returns null if it is not a whole number.
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

/* ---------- MIDDLEWARE ---------- */

// Read JSON sent in the body of a request (needed for PUT).
app.use(express.json());

// Allow a page opened from another address (for example Live Server on port 5500)
// to call this API. When the page is served by this server, it is not needed.
app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

// Wait a moment before answering any /api request (see DELAY_MS above).
app.use("/api", function (req, res, next) {
    setTimeout(next, DELAY_MS);
});

/* ---------- API ENDPOINTS ---------- */

// GET /api/health  ->  { "status": "ok" }
app.get("/api/health", function (req, res) {
    res.json({ status: "ok" });
});

// GET /api/tasks  ->  an array with every task
app.get("/api/tasks", function (req, res) {
    res.json(tasks);
});

// GET /api/tasks/3  ->  the task with id 3
app.get("/api/tasks/:id", function (req, res) {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "The task id must be a whole number, like 3." });
    }

    const task = tasks.find(function (item) { return item.id === id; });
    if (!task) {
        return res.status(404).json({ error: "Task " + id + " was not found." });
    }

    res.json(task);
});

// PUT /api/tasks/3  with a body like { "status": "completed" }
app.put("/api/tasks/:id", function (req, res) {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "The task id must be a whole number, like 3." });
    }

    const task = tasks.find(function (item) { return item.id === id; });
    if (!task) {
        return res.status(404).json({ error: "Task " + id + " was not found." });
    }

    const status = req.body ? req.body.status : undefined;
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error: "The status must be one of: " + VALID_STATUSES.join(", ") + "."
        });
    }

    task.status = status;

    // Business rule: when a task is completed and nothing else is in progress,
    // the next task that has not started becomes the current one.
    if (status === "completed") {
        const working = tasks.some(function (item) { return item.status === "in-progress"; });
        if (!working) {
            const next = tasks.find(function (item) { return item.status === "not-started"; });
            if (next) {
                next.status = "in-progress";
            }
        }
    }

    res.json(task);
});

// POST /api/reset  ->  restore the tasks from tasks.json (an extra, used by "Reset progress")
app.post("/api/reset", function (req, res) {
    tasks = readTasksFromFile();
    res.json(tasks);
});

// Any other /api address does not exist.
app.use("/api", function (req, res) {
    res.status(404).json({ error: "That API endpoint does not exist." });
});

/* ---------- THE WEBSITE ---------- */

// Serve the frontend files, so http://localhost:3000/dashboard.html works.
app.use(express.static(FRONTEND_DIR));

/* ---------- ERRORS ---------- */

// Send errors back as JSON (for example, a request body that is not valid JSON).
app.use(function (err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: status === 400 ? "The request body is not valid JSON." : "Something went wrong on the server."
    });
});

/* ---------- START ---------- */

app.listen(PORT, function (error) {
    if (error) {
        console.error("Could not start the server: " + error.message);
        process.exit(1);
    }
    console.log("TechBridge API running at http://localhost:" + PORT);
    console.log("Dashboard:  http://localhost:" + PORT + "/dashboard.html");
    console.log("All tasks:  http://localhost:" + PORT + "/api/tasks");
});