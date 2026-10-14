/* ==========================================================
   TechBridge | Interactive Internship Roadmap (Task 4)
   Plain JavaScript. No frameworks, no libraries.
   ----------------------------------------------------------
   Concepts used (and where):
   1. Variables ........ currentTrack, buttons, containers
   2. Arrays ........... dataAnalyticsTasks, webDevelopmentTasks
   3. Objects .......... each task, plus the "tracks" lookup
   4. Functions ........ showTrack(), renderTasks(), ...
   5. Event listeners .. click on the track buttons, hashchange
   6. Conditionals ..... if / else in showTrack() and friends
   7. DOM manipulation . createElement, textContent, append
   ========================================================== */

/* ---------- 2 + 3. ARRAYS OF OBJECTS: the task data ---------- */

// Each task is an OBJECT. Each track is an ARRAY of 8 of them.
const dataAnalyticsTasks = [
    { number: 1, day: 1,  level: 1, difficulty: "Beginner",
      title: "Data Cleaning Basics",
      description: "Clean a messy dataset using Google Sheets or Excel. Identify and fix duplicate rows, blank cells, inconsistent formatting, and incorrect data types." },
    { number: 2, day: 4,  level: 1, difficulty: "Beginner",
      title: "Formulas & Pivot Tables",
      description: "Use spreadsheet formulas and Pivot Tables to answer questions and extract useful insights from a dataset." },
    { number: 3, day: 8,  level: 2, difficulty: "Beginner → Intermediate",
      title: "Data Visualization",
      description: "Create charts and a simple dashboard that communicate useful insights from a dataset." },
    { number: 4, day: 11, level: 2, difficulty: "Beginner → Intermediate",
      title: "Introduction to SQL",
      description: "Practice basic SQL queries and use them to answer real-world questions about data." },
    { number: 5, day: 15, level: 3, difficulty: "Intermediate",
      title: "SQL Joins & Aggregations",
      description: "Use JOIN, GROUP BY and aggregate functions such as COUNT, SUM and AVG to analyze information across multiple tables." },
    { number: 6, day: 19, level: 3, difficulty: "Intermediate",
      title: "Lookup Functions & Data Wrangling",
      description: "Use VLOOKUP or XLOOKUP to combine related datasets and handle data mismatches." },
    { number: 7, day: 22, level: 3, difficulty: "Intermediate",
      title: "Mini Analysis Project",
      description: "Complete a small end-to-end analysis involving data cleaning, formulas, Pivot Tables, charts and recommendations." },
    { number: 8, day: 26, level: 3, difficulty: "Intermediate",
      title: "Capstone Project",
      description: "Complete a larger project combining spreadsheet analysis and SQL using at least two related tables." }
];

const webDevelopmentTasks = [
    { number: 1, day: 1,  level: 1, difficulty: "Beginner",
      title: "Build the TechBridge Homepage",
      description: "Create the first version of the TechBridge website using HTML and CSS." },
    { number: 2, day: 4,  level: 1, difficulty: "Beginner",
      title: "Build the TechBridge Programs Experience",
      description: "Create a Programs experience presenting TechBridge's available learning programs." },
    { number: 3, day: 8,  level: 2, difficulty: "Beginner → Intermediate",
      title: "Build the Internship Tasks Experience",
      description: "Create an interface that presents the TechBridge internship tasks and helps users understand the internship journey." },
    { number: 4, day: 11, level: 2, difficulty: "Beginner → Intermediate",
      title: "Build an Interactive Internship Roadmap",
      description: "Use JavaScript to allow visitors to switch between the Data Analytics and Web Development internship tracks." },
    { number: 5, day: 15, level: 3, difficulty: "Intermediate",
      title: "Build the Intern Registration Experience",
      description: "Create a professional registration and onboarding interface for TechBridge interns." },
    { number: 6, day: 19, level: 3, difficulty: "Intermediate",
      title: "Build the Task Submission System",
      description: "Create an interface through which interns can prepare and submit their task work." },
    { number: 7, day: 22, level: 3, difficulty: "Intermediate",
      title: "Build the Intern Dashboard",
      description: "Create a dashboard where an intern can view their profile, progress, tasks and submissions." },
    { number: 8, day: 26, level: 3, difficulty: "Intermediate",
      title: "Build the Complete TechBridge Internship Platform",
      description: "Combine the different components created during the internship into a complete TechBridge platform." }
];

// One more OBJECT that groups everything about a track.
const tracks = {
    "data-analytics": {
        name: "Data Analytics",
        summary: "Spreadsheets, SQL and dashboards, from cleaning data to a capstone project.",
        tasks: dataAnalyticsTasks
    },
    "web-development": {
        name: "Web Development",
        summary: "HTML, CSS and JavaScript, from the first homepage to a complete platform.",
        tasks: webDevelopmentTasks
    }
};

/* ---------- 1. VARIABLES ---------- */

const INTERNSHIP_DAYS = 30;                 // length of the internship
const DEFAULT_TRACK = "web-development";    // continues from Tasks 1 to 3
let currentTrack = DEFAULT_TRACK;           // the track being viewed right now

const trackButtons   = document.querySelectorAll(".track-btn");
const viewingName    = document.getElementById("viewing-track");
const viewingSummary = document.getElementById("viewing-summary");
const viewingBox     = document.getElementById("viewing");
const dayBarPoints   = document.getElementById("daybar-points");
const journeyList    = document.getElementById("journey-list");

/* ---------- 4. FUNCTIONS ---------- */

// Small helper: make an element, give it a class and some text.
function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

// Day 1 sits at 0% of the bar, Day 30 at 100%.
function dayToPercent(day) {
    return ((day - 1) / (INTERNSHIP_DAYS - 1)) * 100;
}

// Build the 3-segment difficulty meter for a level (1, 2 or 3).
function makeMeter(level) {
    const meter = makeElement("span", "meter");
    meter.setAttribute("role", "img");
    meter.setAttribute("aria-label", "Difficulty " + level + " of 3");
    for (let i = 0; i < 3; i++) {
        meter.append(document.createElement("i"));
    }
    return meter;
}

// Build one task card (an <li>) from one task object.
function createTaskCard(task, position) {
    const item = makeElement("li", "task lvl-" + task.level);
    item.id = "task-" + task.number;
    item.style.setProperty("--i", position);   // used to stagger the animation

    const day = makeElement("div", "task-day");
    day.append(makeElement("span", "task-day-label", "Day"));
    day.append(makeElement("span", "task-day-num", String(task.day)));

    const card = makeElement("article", "task-card");
    const meta = makeElement("div", "task-meta");
    meta.append(makeElement("span", "task-badge", "Task " + task.number));
    meta.append(makeElement("span", "level", task.difficulty));
    meta.append(makeMeter(task.level));

    card.append(meta);
    card.append(makeElement("h3", "", task.title));
    card.append(makeElement("p", "", task.description));

    item.append(day, card);
    return item;
}

// Draw the 8 task cards for the chosen track.
function renderTasks(trackTasks) {
    journeyList.replaceChildren();               // clear the old cards
    trackTasks.forEach(function (task, index) {  // loop through the array
        journeyList.append(createTaskCard(task, index));
    });
}

// Draw the Day 1 to Day 30 progress bar for the chosen track.
function renderDayBar(trackTasks) {
    dayBarPoints.replaceChildren();

    trackTasks.forEach(function (task) {
        const point = makeElement("li", "at-" + task.day);
        point.style.left = dayToPercent(task.day) + "%";

        const dot = makeElement("a", "dot lvl-" + task.level, String(task.number));
        dot.href = "#task-" + task.number;
        dot.setAttribute("aria-label",
            "Task " + task.number + ", Day " + task.day + ": " + task.title);

        point.append(dot, makeElement("span", "dot-day", "Day " + task.day));
        dayBarPoints.append(point);
    });

    // The finish line at Day 30.
    const end = makeElement("li", "at-30 end");
    end.style.left = "100%";
    const endDot = makeElement("span", "end-dot");
    endDot.setAttribute("aria-hidden", "true");
    end.append(endDot, makeElement("span", "dot-day", "Day 30"));
    dayBarPoints.append(end);
}

// Update the "Currently Viewing" banner.
function renderViewing(trackId) {
    const track = tracks[trackId];
    viewingName.textContent = track.name;
    viewingSummary.textContent = track.tasks.length + " tasks · " + track.summary;
    viewingBox.dataset.track = trackId;          // CSS uses this for the accent colour
}

// Mark the chosen button as selected and the other as not selected.
function updateButtons(trackId) {
    trackButtons.forEach(function (button) {
        const isSelected = button.dataset.track === trackId;
        button.setAttribute("aria-pressed", isSelected ? "true" : "false");
        button.querySelector(".track-state").textContent =
            isSelected ? "Currently viewing" : "View this track";
    });
}

// Is this a track we know about?
function isValidTrack(trackId) {
    return Object.prototype.hasOwnProperty.call(tracks, trackId);
}

// The main function: switch the whole page to one track.
function showTrack(trackId) {
    // 6. CONDITIONAL LOGIC: only accept a real track, otherwise use the default.
    if (!isValidTrack(trackId)) {
        trackId = DEFAULT_TRACK;
    }

    currentTrack = trackId;                      // remember the choice

    // Decide which array of tasks to display.
    let selectedTasks;
    if (trackId === "data-analytics") {
        selectedTasks = dataAnalyticsTasks;
    } else {
        selectedTasks = webDevelopmentTasks;
    }

    // 7. DOM MANIPULATION: change what the visitor sees. No page reload.
    updateButtons(trackId);
    renderViewing(trackId);
    renderDayBar(selectedTasks);
    renderTasks(selectedTasks);

    // Keep the address bar in step so the link can be shared.
    if (window.location.hash !== "#" + trackId) {
        history.replaceState(null, "", "#" + trackId);
    }
}

// Read #data-analytics or #web-development from the web address.
function getTrackFromHash() {
    const fromHash = window.location.hash.replace("#", "");
    return isValidTrack(fromHash) ? fromHash : null;
}

/* ---------- 5. EVENT LISTENERS ---------- */

// When a visitor clicks a track button, show that track.
trackButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        showTrack(button.dataset.track);
    });
});

// If the address changes to a track (back button, shared link), follow it.
window.addEventListener("hashchange", function () {
    const requested = getTrackFromHash();
    if (requested !== null && requested !== currentTrack) {
        showTrack(requested);
    }
});

/* ---------- START ---------- */

// Show the track from the link if there is one, otherwise the default.
const startingTrack = getTrackFromHash();
if (startingTrack !== null) {
    showTrack(startingTrack);
} else {
    showTrack(DEFAULT_TRACK);
}