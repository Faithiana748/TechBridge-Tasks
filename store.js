/* ==========================================================
   TechBridge | Data store
   ----------------------------------------------------------
   Reads the starting data from the JSON files in the data folder
   and keeps it in memory while the server runs.
   - tasks.json       the 8 internship tasks (can be changed with PUT)
   - challenges.json  the Challenge Hub challenges (read only)
   Restarting the server puts the tasks back to their starting state.
   ========================================================== */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const VALID_STATUSES = ["completed", "in-progress", "not-started"];

function readJson(fileName) {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));
}

let tasks = readJson("tasks.json");
const challenges = readJson("challenges.json");

function getTasks() {
    return tasks;
}

function getChallenges() {
    return challenges;
}

// Put the tasks back to what is written in tasks.json.
function resetTasks() {
    tasks = readJson("tasks.json");
    return tasks;
}

// Turn the ":id" part of a URL into a whole number. Returns null if it is not one.
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { VALID_STATUSES, getTasks, getChallenges, resetTasks, parseId };