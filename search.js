/* ==========================================================
   TechBridge | Search route
   Mounted at /api/search in server.js
     GET /api/search?q=javascript
   Returns the tasks and the challenges that match every word typed.
   ========================================================== */

const express = require("express");
const store = require("../store");

const router = express.Router();

// Does this text contain every word of the search? (not case sensitive)
function matchesAllWords(text, words) {
    const haystack = text.toLowerCase();
    return words.every(function (word) { return haystack.includes(word); });
}

function taskText(task) {
    return [task.title, task.description, task.objective, task.skills.join(" "), task.produce.join(" ")].join(" ");
}

function challengeText(challenge) {
    return [challenge.name, challenge.track, challenge.difficulty, challenge.description,
            challenge.skills.join(" "), challenge.tools.join(" ")].join(" ");
}

// GET /api/search?q=javascript  ->  { query, tasks: [...], challenges: [...], total }
router.get("/", function (req, res) {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const words = query.toLowerCase().split(/\s+/).filter(function (word) { return word !== ""; });

    if (words.length === 0) {
        return res.json({ query: "", tasks: [], challenges: [], total: 0 });
    }

    const tasks = store.getTasks().filter(function (task) { return matchesAllWords(taskText(task), words); });
    const challenges = store.getChallenges().filter(function (item) { return matchesAllWords(challengeText(item), words); });

    res.json({ query: query, tasks: tasks, challenges: challenges, total: tasks.length + challenges.length });
});

module.exports = router;