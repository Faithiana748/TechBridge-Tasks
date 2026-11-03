/* ==========================================================
   TechBridge | Task routes
   Mounted at /api/tasks in server.js
     GET /api/tasks        all tasks
     GET /api/tasks/:id    one task
     PUT /api/tasks/:id    change a task's status
   ========================================================== */

const express = require("express");
const store = require("../store");

const router = express.Router();

// GET /api/tasks  ->  an array with every task
router.get("/", function (req, res) {
    res.json(store.getTasks());
});

// GET /api/tasks/3  ->  the task with id 3
router.get("/:id", function (req, res) {
    const id = store.parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "The task id must be a whole number, like 3." });
    }

    const task = store.getTasks().find(function (item) { return item.id === id; });
    if (!task) {
        return res.status(404).json({ error: "Task " + id + " was not found." });
    }

    res.json(task);
});

// PUT /api/tasks/3  with a body like { "status": "completed" }
router.put("/:id", function (req, res) {
    const id = store.parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "The task id must be a whole number, like 3." });
    }

    const tasks = store.getTasks();
    const task = tasks.find(function (item) { return item.id === id; });
    if (!task) {
        return res.status(404).json({ error: "Task " + id + " was not found." });
    }

    const status = req.body ? req.body.status : undefined;
    if (!store.VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error: "The status must be one of: " + store.VALID_STATUSES.join(", ") + "."
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

module.exports = router;