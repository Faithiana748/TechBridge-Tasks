/* ==========================================================
   TechBridge Intern Management Platform | Backend
   Node.js + Express
   ----------------------------------------------------------
   Endpoints
     GET  /api/health           Check that the server is running
     GET  /api/tasks            All tasks                      (routes/tasks.js)
     GET  /api/tasks/:id        One task
     PUT  /api/tasks/:id        Update a task's status
     GET  /api/challenges       All challenges (?track= &difficulty=)   (routes/challenges.js)
     GET  /api/challenges/:id   One challenge
     GET  /api/search?q=word    Search tasks and challenges    (routes/search.js)
     POST /api/reset            Put the tasks back to their starting state

   Run it:   npm install   then   npm start
   Open:     http://localhost:3000/
   ========================================================== */

const express = require("express");
const fs = require("fs");
const path = require("path");

const store = require("./store");
const tasksRoutes = require("./routes/tasks");
const challengesRoutes = require("./routes/challenges");
const searchRoutes = require("./routes/search");

const app = express();

/* ---------- SETTINGS ---------- */

const PORT = process.env.PORT || 3000;

// A small pause before every API answer. Real servers take a moment to reply,
// and this makes the "Loading..." messages visible.
// Turn it off with:  DELAY_MS=0 npm start
const DELAY_MS = process.env.DELAY_MS !== undefined ? Number(process.env.DELAY_MS) : 400;

// The frontend folder. It sits next to "backend" in the project, or one level up
// when the website files live in the same folder as "backend" (like the GitHub repo).
const FRONTEND_DIR = fs.existsSync(path.join(__dirname, "..", "frontend"))
    ? path.join(__dirname, "..", "frontend")
    : path.join(__dirname, "..");

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

// The routes live in their own files (see the routes folder).
app.use("/api/tasks", tasksRoutes);
app.use("/api/challenges", challengesRoutes);
app.use("/api/search", searchRoutes);

// POST /api/reset  ->  restore the tasks from tasks.json (used by "Reset progress")
app.post("/api/reset", function (req, res) {
    res.json(store.resetTasks());
});

// Any other /api address does not exist.
app.use("/api", function (req, res) {
    res.status(404).json({ error: "That API endpoint does not exist." });
});

/* ---------- THE WEBSITE ---------- */

// Serve the frontend files, so http://localhost:3000/ and /dashboard.html work.
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
    console.log("TechBridge platform running at http://localhost:" + PORT);
    console.log("Home:        http://localhost:" + PORT + "/");
    console.log("Dashboard:   http://localhost:" + PORT + "/dashboard.html");
    console.log("All tasks:   http://localhost:" + PORT + "/api/tasks");
});