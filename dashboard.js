/* ==========================================================
   TechBridge | Intern Dashboard (Task 6 + Task 7)
   Plain JavaScript. No frameworks, no libraries.
   ----------------------------------------------------------
   Task 7 change: the tasks are no longer written in this file.
   The dashboard asks the Node.js + Express backend for them:

     GET /api/tasks        load all tasks
     GET /api/tasks/:id    load one task (View Task)
     PUT /api/tasks/:id    change a task's status (Mark as Completed)

   It also handles:
     - a loading state while it waits
     - an error state when the backend cannot be reached
     - a Backend Status indicator (Connected, Offline, Demo mode)
     - filters, progress numbers and the Technology Explorer
   Nothing here reloads the page.
   ========================================================== */

/* ---------- 1. SETTINGS AND DATA ---------- */

// A sample intern. Change these values to show a different intern.
const intern = {
    name: "Faithiana",
    track: "Web Development Intern",
    welcome: "Good to see you again. Here is where your internship stands today."
};

const TOTAL_DAYS = 30;
const CHALLENGE_COUNT = 8;   // number of challenges in the Challenge Hub (Task 5)

// The API sends statuses as "completed", "in-progress" and "not-started".
// This object turns them into the words shown on the page.
const STATUS_LABELS = {
    "completed": "Completed",
    "in-progress": "In Progress",
    "not-started": "Not Started"
};
const STATUSES = Object.keys(STATUS_LABELS);

// Where is this page running?
//   localhost / file  -> use the real backend
//   anywhere else     -> a static host (like GitHub Pages) has no backend, so use the demo API
const IS_LOCAL = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
// If this page is served by the Express server (port 3000), "/api/tasks" is enough.
// If it is opened some other way (Live Server, a double-click), call the server by its full address.
const API_BASE = IS_LOCAL && window.location.port !== "3000" ? "http://localhost:3000" : "";

// The Technology Explorer content. One object per button.
const technologies = [
    {
        id: "nextjs",
        name: "Next.js",
        tagline: "A React framework for building modern web applications.",
        about: "Next.js is built on top of React, a library for building user interfaces. It adds the things a real website needs: page routing, fast page loading, and the option to render pages on the server before they reach the browser.",
        usedFor: [
            "Marketing sites, blogs and online shops that need to load fast",
            "Web applications with many pages and logins",
            "Sites that must be easy for search engines to read"
        ],
        link: "https://nextjs.org",
        linkLabel: "Learn more about Next.js"
    },
    {
        id: "vue",
        name: "Vue.js",
        tagline: "A friendly JavaScript framework for building user interfaces.",
        about: "Vue.js helps developers build interfaces from small reusable pieces called components. It is known for being easy to learn, and you can add it to one part of a page or use it to build a whole application.",
        usedFor: [
            "Interactive dashboards and admin panels",
            "Single-page applications that update without reloading",
            "Adding interactive features to an existing website"
        ],
        link: "https://vuejs.org",
        linkLabel: "Learn more about Vue.js"
    },
    {
        id: "angular",
        name: "Angular",
        tagline: "A complete framework from Google for large web applications.",
        about: "Angular is a framework written in TypeScript. It comes with routing, forms and tools for talking to servers already built in, so teams follow one clear structure as an application grows.",
        usedFor: [
            "Large business and enterprise applications",
            "Projects built by big teams that need a shared structure",
            "Complex forms, data tables and internal tools"
        ],
        link: "https://angular.dev",
        linkLabel: "Learn more about Angular"
    },
    {
        id: "backend",
        name: "Backend",
        tagline: "The part of a website that runs on a server, out of sight.",
        about: "Backend development means building the code that runs on a server. It stores and protects data, checks who a user is, and applies the rules of the application. The frontend (what you see in the browser) talks to the backend by sending requests, and the backend sends back data, usually as JSON.",
        usedFor: [
            "Saving and reading data in a database",
            "Logging users in and keeping their information safe",
            "Providing an API that the frontend can call"
        ],
        flow: [
            { label: "Frontend (the browser)", arrow: "sends a request" },
            { label: "Backend (the server)", arrow: "reads and saves data" },
            { label: "Database", arrow: "" }
        ],
        flowNote: "The backend then sends a response, usually JSON, back to the frontend, which shows it on the page.",
        techs: [
            { name: "Node.js", note: "Runs JavaScript on the server, so one language works on both sides." },
            { name: "Express.js", note: "A small framework on Node.js for building web servers and APIs." },
            { name: "Django", note: "A Python framework with many features included, good for fast, secure builds." },
            { name: "Flask", note: "A lightweight Python framework for small apps and simple APIs." },
            { name: "Laravel", note: "A PHP framework with clear structure for full web applications." },
            { name: ".NET", note: "Microsoft's platform for building web apps and APIs, usually in C#." }
        ],
        link: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction",
        linkLabel: "Learn more about backend development"
    }
];

/* ---------- 2. VARIABLES: what the dashboard remembers ---------- */

let tasks = [];                    // filled from the API (starts empty)
let loadState = "loading";         // "loading", "ready" or "error"
let backendState = "checking";     // "checking", "connected", "offline" or "demo"
let demoMode = !IS_LOCAL;          // true = use the browser demo API instead of the server
let lastError = null;              // the last error from the API
let currentFilter = "all";         // all, completed, in-progress or not-started
let toastTimer = null;             // hides the small message after a few seconds
let lastTaskNumber = null;         // the task whose details window was opened last
let viewRequestId = 0;             // stops an old View Task answer replacing a newer one
const busyTasks = new Set();       // tasks that are waiting for the server to save a change

const el = {
    internName:   document.getElementById("intern-name"),
    internTrack:  document.getElementById("intern-track"),
    welcomeText:  document.getElementById("welcome-text"),
    statusPill:   document.getElementById("status-pill"),
    backendPill:  document.getElementById("backend-status"),
    recheckBtn:   document.getElementById("backend-recheck"),
    demoBanner:   document.getElementById("demo-banner"),
    demoText:     document.getElementById("demo-banner-text"),
    realBackend:  document.getElementById("use-real-backend"),
    heroContinue: document.getElementById("hero-continue"),
    countDone:    document.getElementById("count-done"),
    countTotal:   document.getElementById("count-total"),
    countLeft:    document.getElementById("count-left"),
    statTotal:    document.getElementById("stat-total"),
    statDone:     document.getElementById("stat-done"),
    statLeft:     document.getElementById("stat-left"),
    percent:      document.getElementById("percent"),
    bar:          document.getElementById("progress-bar"),
    barFill:      document.getElementById("progress-fill"),
    celebration:  document.getElementById("celebration"),
    current:      document.getElementById("current-task"),
    loading:      document.getElementById("task-loading"),
    errorBox:     document.getElementById("task-error"),
    errorHint:    document.getElementById("task-error-hint"),
    retryBtn:     document.getElementById("retry-load"),
    demoBtn:      document.getElementById("use-demo"),
    grid:         document.getElementById("task-grid"),
    empty:        document.getElementById("task-empty"),
    filterBtns:   document.querySelectorAll(".chip[data-filter]"),
    resetBtn:     document.getElementById("reset-progress"),
    toast:        document.getElementById("toast"),
    dialog:       document.getElementById("task-dialog"),
    dialogBody:   document.getElementById("dialog-content"),
    challengeCount: document.getElementById("challenge-count"),
    techButtons:  document.getElementById("tech-buttons"),
    techPanel:    document.getElementById("tech-panel")
};

/* ---------- 3. SMALL HELPERS ---------- */

// Make an element with a class and text. textContent keeps it safe from HTML tricks.
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

function findTask(number) {
    return tasks.find(function (task) { return task.id === number; });
}

/* ---------- 4. TALKING TO THE API ---------- */

// An error with extra details about what went wrong.
//   offline = true  -> the server could not be reached at all (or did not answer with JSON)
//   offline = false -> the server answered, but with an error (for example 404)
function makeApiError(message, status, offline) {
    const error = new Error(message);
    error.status = status;
    error.offline = offline;
    return error;
}

// Send one request to the API and return the JSON answer.
//   apiRequest("/api/tasks")
//   apiRequest("/api/tasks/3", { method: "PUT", body: { status: "completed" } })
async function apiRequest(path, options) {
    const method = options && options.method ? options.method : "GET";
    const body = options ? options.body : undefined;

    // Demo mode: the "server" is a small simulation in demo-api.js.
    if (demoMode) {
        if (!window.TechBridgeDemoApi) {
            throw makeApiError("The demo API is not available.", 0, true);
        }
        try {
            return await window.TechBridgeDemoApi.request(method, path, body);
        } catch (error) {
            throw makeApiError(error.message, error.status || 500, false);
        }
    }

    // Real mode: fetch() sends the request to the Express server.
    let response;
    try {
        response = await fetch(API_BASE + path, {
            method: method,
            headers: body !== undefined ? { "Content-Type": "application/json" } : {},
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch (networkError) {
        // The server is stopped, the address is wrong, or there is no connection.
        throw makeApiError("The backend could not be reached.", 0, true);
    }

    // Read the answer as JSON. If it is not JSON, this is not our API.
    let data;
    try {
        data = await response.json();
    } catch (parseError) {
        throw makeApiError("The server did not send JSON.", response.status, true);
    }

    if (!response.ok) {
        const message = data && data.error ? data.error : "The server returned an error.";
        throw makeApiError(message, response.status, false);
    }
    return data;
}

// Show the Backend Status in the welcome section.
function setBackendState(state) {
    backendState = state;
    const labels = {
        "checking": "Checking...",
        "connected": "Connected",
        "offline": "Offline",
        "demo": "Demo mode (simulated)"
    };
    el.backendPill.textContent = labels[state];
    el.backendPill.className = "backend-pill is-" + state;
    el.recheckBtn.hidden = state !== "offline";
}

// Update the backend status after a request succeeded or failed.
function noteRequestResult(error) {
    if (demoMode) {
        setBackendState("demo");
    } else if (!error || !error.offline) {
        setBackendState("connected");
    } else {
        setBackendState("offline");
    }
}

// Turn an error into a friendly sentence.
function describeError(error) {
    if (error.offline && !demoMode) {
        return "The backend is not responding. Start it with npm start in the backend folder.";
    }
    return error.message;
}

/* ---------- 5. LOADING THE TASKS (GET /api/tasks) ---------- */

// Ask the API for all the tasks.
//   showLoading = true  -> show "Loading tasks..." while waiting
//   showLoading = false -> refresh quietly in the background
async function loadTasks(showLoading) {
    if (showLoading) {
        loadState = "loading";
        refreshAll();
    }

    try {
        tasks = await apiRequest("/api/tasks");
        loadState = "ready";
        lastError = null;
        noteRequestResult(null);
    } catch (error) {
        lastError = error;
        noteRequestResult(error);
        if (showLoading || tasks.length === 0) {
            loadState = "error";
        } else {
            showToast("Could not refresh the tasks. " + describeError(error));
        }
    }
    refreshAll();
}

/* ---------- 6. PROGRESS CALCULATIONS ---------- */

function countByStatus(status) {
    return tasks.filter(function (task) { return task.status === status; }).length;
}

// Return every number the progress section needs, in one object.
function getProgress() {
    const total = tasks.length;
    const completed = countByStatus("completed");
    const percent = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;   // 5/8 -> 62.5
    return {
        total: total,
        completed: completed,
        remaining: total - completed,
        percent: percent
    };
}

// The overall internship status, worked out from the tasks.
function getInternshipStatus() {
    const progress = getProgress();
    if (progress.total > 0 && progress.completed === progress.total) {
        return "completed";
    } else if (progress.completed === 0 && countByStatus("in-progress") === 0) {
        return "not-started";
    }
    return "in-progress";
}

// The task the intern should work on now: the In Progress one, else the first Not Started.
function getCurrentTask() {
    const working = tasks.find(function (task) { return task.status === "in-progress"; });
    if (working) {
        return working;
    }
    return tasks.find(function (task) { return task.status === "not-started"; }) || null;
}

/* ---------- 7. DRAWING THE PAGE ---------- */

function renderBackendNotice() {
    // Demo mode notice
    el.demoBanner.hidden = !demoMode;
    if (demoMode) {
        if (IS_LOCAL) {
            el.demoText.textContent = "Demo mode is on. The tasks come from a simulation inside your browser, not from the Express server.";
            el.realBackend.hidden = false;
        } else {
            el.demoText.textContent = "Demo mode: this hosted page has no server, so the API is simulated in your browser using the same endpoints. Run the Node.js backend on your computer to use the real API.";
            el.realBackend.hidden = true;
        }
    }
}

function renderWelcome() {
    el.internName.textContent = intern.name;
    el.internTrack.textContent = intern.track;
    el.welcomeText.textContent = intern.welcome;

    // Conditional logic: only show the status once the tasks have loaded.
    if (loadState === "ready") {
        const status = getInternshipStatus();
        el.statusPill.textContent = STATUS_LABELS[status];
        el.statusPill.className = "status-pill is-" + status;
    } else if (loadState === "error") {
        el.statusPill.textContent = "Unavailable";
        el.statusPill.className = "status-pill is-loading";
    } else {
        el.statusPill.textContent = "Loading...";
        el.statusPill.className = "status-pill is-loading";
    }

    const current = loadState === "ready" ? getCurrentTask() : null;
    if (current) {
        el.heroContinue.hidden = false;
        el.heroContinue.dataset.task = current.id;
        el.heroContinue.textContent = "Continue Task " + current.id;
    } else {
        el.heroContinue.hidden = true;
    }
}

function renderProgress() {
    const ready = loadState === "ready";
    const progress = getProgress();
    const dash = "\u2013";

    el.countDone.textContent = ready ? progress.completed : dash;
    el.countTotal.textContent = ready ? progress.total : dash;
    el.countLeft.textContent = ready ? progress.remaining : dash;
    el.statTotal.textContent = ready ? progress.total : dash;
    el.statDone.textContent = ready ? progress.completed : dash;
    el.statLeft.textContent = ready ? progress.remaining : dash;
    el.percent.textContent = ready ? progress.percent + "%" : dash;

    const width = ready ? progress.percent : 0;
    el.barFill.style.width = width + "%";
    el.bar.setAttribute("aria-valuenow", String(Math.round(width)));
    if (ready) {
        el.bar.setAttribute("aria-valuetext",
            progress.completed + " of " + progress.total + " tasks completed, " + progress.percent + " percent");
    } else {
        el.bar.removeAttribute("aria-valuetext");
    }

    // Celebrate when every task is done.
    el.celebration.hidden = !(ready && progress.total > 0 && progress.remaining === 0);
}

function renderCurrentTask() {
    el.current.replaceChildren();

    if (loadState !== "ready") {
        el.current.append(makeElement("p", "current-label", "Current task"));
        el.current.append(makeElement("p", "current-title", loadState === "loading" ? "Loading tasks..." : "Tasks are not available right now."));
        return;
    }

    const current = getCurrentTask();
    if (!current) {
        el.current.append(makeElement("p", "current-label", "All tasks complete"));
        el.current.append(makeElement("p", "current-title", "Nothing left to do. Well done."));
        return;
    }

    const working = current.status === "in-progress";
    el.current.append(makeElement("p", "current-label", working ? "Current task" : "Up next"));
    el.current.append(makeElement("p", "current-title", "Task " + current.id + ": " + current.title));

    const button = makeElement("button", "btn btn-small", working ? "Continue Task" : "Start Task");
    button.type = "button";
    button.dataset.action = working ? "view" : "start";
    button.dataset.task = current.id;
    el.current.append(button);
}

// A small status badge with an icon, so colour is never the only clue.
function makeStatusBadge(status) {
    const badge = makeElement("span", "status-badge is-" + status);
    badge.append(makeElement("span", "status-icon"));
    badge.append(makeElement("span", "", STATUS_LABELS[status]));
    return badge;
}

// The second button on a card depends on the task's status.
function makeActionButton(task) {
    let label = "Start Task";
    let action = "start";
    let style = "btn btn-small btn-ghost-dark";

    if (task.status === "in-progress") {
        label = "Mark as Completed";
        action = "complete";
        style = "btn btn-small";
    } else if (task.status === "completed") {
        label = "Reopen";
        action = "reopen";
    }

    const button = makeElement("button", style, label);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.task = task.id;
    button.dataset.label = label;
    button.setAttribute("aria-label", label + ": Task " + task.id + ", " + task.title);
    if (busyTasks.has(task.id)) {
        button.disabled = true;
        button.textContent = "Saving...";
    }
    return button;
}

function createTaskCard(task, position) {
    const item = makeElement("li", "task-item");
    item.style.setProperty("--i", position);

    const card = makeElement("article", "task-tile is-" + task.status);
    card.id = "task-card-" + task.id;
    card.setAttribute("aria-busy", busyTasks.has(task.id) ? "true" : "false");

    const top = makeElement("div", "tile-top");
    top.append(makeElement("span", "task-badge", "Task " + task.id));
    top.append(makeElement("span", "tile-day", "Day " + task.day));

    const view = makeElement("button", "btn btn-small btn-blue", "View Task");
    view.type = "button";
    view.dataset.action = "view";
    view.dataset.task = task.id;
    view.setAttribute("aria-label", "View Task " + task.id + ": " + task.title);

    const actions = makeElement("div", "tile-actions");
    actions.append(view, makeActionButton(task));

    card.append(
        top,
        makeElement("h3", "", task.title),
        makeElement("p", "tile-desc", task.description),
        makeStatusBadge(task.status),
        actions
    );
    item.append(card);
    return item;
}

// Show the loading box, the error box, or the task cards.
function renderTasks() {
    el.loading.hidden = loadState !== "loading";
    el.errorBox.hidden = loadState !== "error";
    el.resetBtn.disabled = loadState !== "ready";

    if (loadState === "error") {
        el.errorHint.textContent = lastError ? describeError(lastError) : "";
        el.demoBtn.hidden = demoMode;
    }

    if (loadState !== "ready") {
        el.grid.replaceChildren();
        el.grid.hidden = true;
        el.empty.hidden = true;
        return;
    }

    // Filtering: keep every task when "all" is chosen, otherwise only matching ones.
    const visible = tasks.filter(function (task) {
        return currentFilter === "all" || task.status === currentFilter;
    });

    el.grid.replaceChildren();
    visible.forEach(function (task, index) {
        el.grid.append(createTaskCard(task, index));
    });

    el.grid.hidden = visible.length === 0;
    el.empty.hidden = visible.length !== 0;
    if (visible.length === 0) {
        el.empty.querySelector("p").textContent =
            "There are no tasks marked \"" + STATUS_LABELS[currentFilter] + "\" right now.";
    }
}

// Update the filter buttons: highlight the chosen one and show counts.
function renderFilters() {
    el.filterBtns.forEach(function (button) {
        const value = button.dataset.value;
        let count = "\u2013";
        if (loadState === "ready") {
            count = value === "all" ? tasks.length : countByStatus(value);
        }
        button.setAttribute("aria-pressed", value === currentFilter ? "true" : "false");
        button.querySelector(".count").textContent = count;
    });
}

// Redraw everything that depends on the task data.
function refreshAll() {
    renderBackendNotice();
    renderWelcome();
    renderProgress();
    renderCurrentTask();
    renderFilters();
    renderTasks();
}

/* ---------- 8. CHANGING A TASK'S STATUS (PUT /api/tasks/:id) ---------- */

function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        el.toast.classList.remove("is-visible");
    }, 4000);
}

// Send the new status to the backend, then refresh the dashboard from its answer.
async function updateStatus(number, newStatus) {
    if (busyTasks.has(number)) {
        return;
    }
    busyTasks.add(number);
    refreshAll();                       // buttons show "Saving..."
    refreshOpenDialogButtons();

    let message = "";
    try {
        // 1. JavaScript sends the request. 2. The backend updates the task.
        await apiRequest("/api/tasks/" + number, { method: "PUT", body: { status: newStatus } });
        noteRequestResult(null);

        // 3. Ask for the tasks again, so the page matches the server
        //    (the server may also have started the next task).
        tasks = await apiRequest("/api/tasks");

        const progress = getProgress();
        if (newStatus === "completed") {
            message = "Task " + number + " completed. " + progress.completed + " of " + progress.total + " done (" + progress.percent + "%).";
            if (progress.remaining === 0) {
                message = "All " + progress.total + " tasks completed. Congratulations!";
            }
        } else {
            message = "Task " + number + " is now " + STATUS_LABELS[newStatus] + ".";
        }
    } catch (error) {
        noteRequestResult(error);
        message = "Could not update Task " + number + ". " + describeError(error);
    }

    busyTasks.delete(number);
    refreshAll();                       // 4. the cards and progress update
    showToast(message);

    if (el.dialog.open && lastTaskNumber === number) {
        openTask(number);               // refresh the details window from the API
    }
}

// Put the tasks back to their starting state (POST /api/reset).
async function resetProgress() {
    el.resetBtn.disabled = true;
    try {
        tasks = await apiRequest("/api/reset", { method: "POST", body: {} });
        noteRequestResult(null);
        showToast("Progress reset to the starting state.");
    } catch (error) {
        noteRequestResult(error);
        showToast("Could not reset the progress. " + describeError(error));
    }
    refreshAll();
}

/* ---------- 9. TASK DETAILS WINDOW (GET /api/tasks/:id) ---------- */

function makeList(className, items) {
    const list = makeElement("ul", className);
    items.forEach(function (text) { list.append(makeElement("li", "", text)); });
    return list;
}

function makeBlock(label, content) {
    const block = makeElement("section", "detail-block");
    block.append(makeElement("h3", "", label));
    block.append(content);
    return block;
}

function makeModalButton(label, action, number, style) {
    const button = makeElement("button", style, label);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.task = number;
    button.dataset.label = label;
    if (busyTasks.has(number)) {
        button.disabled = true;
        button.textContent = "Saving...";
    }
    return button;
}

function makeCloseButton() {
    const close = makeElement("button", "btn btn-ghost-dark", "Close");
    close.type = "button";
    close.dataset.close = "true";
    return close;
}

// While the task is being requested, show a loading message inside the window.
function showDialogLoading(number) {
    el.dialog.dataset.status = "loading";
    const title = makeElement("h2", "", "Loading Task " + number + "...");
    title.id = "dialog-title";
    const loading = makeElement("div", "state-box");
    loading.setAttribute("role", "status");
    loading.append(makeElement("span", "spinner"), makeElement("p", "", "Loading task..."));
    el.dialogBody.replaceChildren(title, loading, makeCloseButton());
}

// If the request fails, say so inside the window instead of leaving it empty.
function showDialogError(number, error) {
    el.dialog.dataset.status = "not-started";
    const title = makeElement("h2", "", "Unable to load this task.");
    title.id = "dialog-title";
    const actions = makeElement("div", "actions");
    const retry = makeElement("button", "btn btn-blue", "Try again");
    retry.type = "button";
    retry.dataset.action = "view";
    retry.dataset.task = number;
    actions.append(retry, makeCloseButton());
    el.dialogBody.replaceChildren(
        title,
        makeElement("p", "dialog-lead", "Please check your connection or try again."),
        makeElement("p", "state-hint", describeError(error)),
        actions
    );
}

// Fill the window with the task that the API returned.
function renderTaskDialog(task) {
    el.dialog.dataset.status = task.status;

    const top = makeElement("div", "tile-top");
    top.append(makeElement("span", "task-badge", "Task " + task.id));
    top.append(makeStatusBadge(task.status));

    const title = makeElement("h2", "", task.title);
    title.id = "dialog-title";

    const facts = makeElement("dl", "facts");
    const day = makeElement("div", "fact");
    day.append(makeElement("dt", "", "Introduced on"), makeElement("dd", "", "Day " + task.day + " of " + TOTAL_DAYS));
    const time = makeElement("div", "fact");
    time.append(makeElement("dt", "", "Estimated time"), makeElement("dd", "", task.time));
    facts.append(day, time);

    // Buttons inside the window depend on the status, just like the card.
    const actions = makeElement("div", "actions");
    if (task.status === "not-started") {
        actions.append(makeModalButton("Start Task", "start", task.id, "btn"));
    }
    if (task.status !== "completed") {
        actions.append(makeModalButton("Mark as Completed", "complete", task.id, task.status === "in-progress" ? "btn" : "btn btn-blue"));
    } else {
        actions.append(makeModalButton("Reopen", "reopen", task.id, "btn btn-blue"));
    }
    if (task.page) {
        const open = makeElement("a", "btn btn-ghost-dark", "Open this page");
        open.href = task.page;
        actions.append(open);
    }
    actions.append(makeCloseButton());

    el.dialogBody.replaceChildren(
        top,
        title,
        makeElement("p", "dialog-lead", task.description),
        facts,
        makeBlock("Objective", makeElement("p", "", task.objective)),
        makeBlock("Skills you practise", makeList("chips-list", task.skills)),
        makeBlock("What you need to produce", makeList("bullet-list", task.produce)),
        actions
    );
}

// While a change is being saved, switch the buttons inside an open window to "Saving...".
function refreshOpenDialogButtons() {
    el.dialogBody.querySelectorAll("button[data-action]").forEach(function (button) {
        if (busyTasks.has(Number(button.dataset.task)) && button.dataset.action !== "view") {
            button.disabled = true;
            button.textContent = "Saving...";
        }
    });
}

// View Task: ask the API for this one task, then show it.
async function openTask(number) {
    lastTaskNumber = number;
    const requestId = ++viewRequestId;

    if (!el.dialog.open) {
        showDialogLoading(number);
        document.body.classList.add("modal-open");
        el.dialog.showModal();
        el.dialog.scrollTop = 0;
    }

    try {
        const task = await apiRequest("/api/tasks/" + number);
        if (requestId !== viewRequestId || !el.dialog.open) {
            return;                     // the window was closed or another task was opened
        }
        noteRequestResult(null);
        renderTaskDialog(task);
    } catch (error) {
        if (requestId !== viewRequestId || !el.dialog.open) {
            return;
        }
        noteRequestResult(error);
        showDialogError(number, error);
    }
    refreshAll();
}

/* ---------- 10. TECHNOLOGY EXPLORER ---------- */

function renderTechButtons() {
    el.techButtons.replaceChildren();
    technologies.forEach(function (tech) {
        const button = makeElement("button", "chip", tech.name);
        button.type = "button";
        button.dataset.tech = tech.id;
        button.setAttribute("aria-pressed", "false");
        el.techButtons.append(button);
    });
}

// Show one technology. The old content is replaced, nothing reloads.
function showTechnology(id) {
    const tech = technologies.find(function (item) { return item.id === id; });
    if (!tech) {
        return;
    }

    // Highlight the chosen button
    el.techButtons.querySelectorAll("button").forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.tech === id ? "true" : "false");
    });

    const parts = [];
    parts.push(makeElement("h3", "tech-name", tech.name));
    parts.push(makeElement("p", "tech-tagline", tech.tagline));
    parts.push(makeElement("p", "", tech.about));
    parts.push(makeBlock("Commonly used for", makeList("bullet-list", tech.usedFor)));

    // Conditional logic: only the Backend entry has a flow diagram and a technologies list.
    if (tech.flow) {
        const flow = makeElement("ol", "flow");
        tech.flow.forEach(function (item) {
            flow.append(makeElement("li", "flow-step", item.label));
            if (item.arrow !== "") {
                flow.append(makeElement("li", "flow-arrow", item.arrow));
            }
        });
        const connect = makeElement("div", "");
        connect.append(flow, makeElement("p", "flow-note", tech.flowNote));
        parts.push(makeBlock("How it connects to the frontend", connect));
    }
    if (tech.techs) {
        const list = makeElement("ul", "tech-list");
        tech.techs.forEach(function (item) {
            const row = makeElement("li", "");
            row.append(makeElement("strong", "", item.name), makeElement("span", "", item.note));
            list.append(row);
        });
        parts.push(makeBlock("Backend technologies you can learn", list));
    }

    const link = makeElement("a", "btn btn-blue btn-small", "Learn More");
    link.href = tech.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", tech.linkLabel + " (opens in a new tab)");
    parts.push(link);

    el.techPanel.replaceChildren.apply(el.techPanel, parts);
}

/* ---------- 11. EVENT LISTENERS ---------- */

// Filter buttons (they filter the tasks that came from the API)
el.filterBtns.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.value;
        renderFilters();
        renderTasks();
    });
});

// One handler for every task button: View, Start, Mark as Completed, Reopen, Continue.
function handleTaskAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) {
        return;
    }
    const number = Number(button.dataset.task);
    const action = button.dataset.action;

    if (action === "view") {
        openTask(number);
    } else if (action === "start") {
        updateStatus(number, "in-progress");
    } else if (action === "complete") {
        updateStatus(number, "completed");
    } else if (action === "reopen") {
        updateStatus(number, "in-progress");
    }
}

el.grid.addEventListener("click", handleTaskAction);
el.current.addEventListener("click", handleTaskAction);
el.dialog.addEventListener("click", function (event) {
    if (event.target.closest("[data-close]")) {
        el.dialog.close();
        return;
    }
    if (event.target === el.dialog) {          // click on the dark backdrop
        el.dialog.close();
        return;
    }
    handleTaskAction(event);
});

el.dialog.addEventListener("close", function () {
    viewRequestId++;                           // ignore any answer still on its way
    document.body.classList.remove("modal-open");
    // Return keyboard focus to the View Task button of the task that was open.
    const back = el.grid.querySelector('button[data-action="view"][data-task="' + lastTaskNumber + '"]');
    if (back) {
        back.focus();
    }
});

// "Continue Task" button in the welcome section
el.heroContinue.addEventListener("click", function () {
    openTask(Number(el.heroContinue.dataset.task));
});

el.resetBtn.addEventListener("click", resetProgress);

// Try the backend again (error box and "Check again" button)
el.retryBtn.addEventListener("click", function () { loadTasks(true); });
el.recheckBtn.addEventListener("click", function () { loadTasks(true); });

// Use the in-browser demo instead of the server, or go back to the server.
el.demoBtn.addEventListener("click", function () {
    demoMode = true;
    setBackendState("demo");
    loadTasks(true);
});
el.realBackend.addEventListener("click", function () {
    demoMode = false;
    setBackendState("checking");
    loadTasks(true);
});

// Technology Explorer buttons
el.techButtons.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-tech]");
    if (button) {
        showTechnology(button.dataset.tech);
    }
});

/* ---------- START ---------- */

el.challengeCount.textContent = CHALLENGE_COUNT;
renderTechButtons();
showTechnology("nextjs");
setBackendState(demoMode ? "demo" : "checking");
loadTasks(true);          // ask the API for the tasks as soon as the page opens