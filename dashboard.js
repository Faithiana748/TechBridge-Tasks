/* ==========================================================
   TechBridge | Intern Dashboard (Task 6)
   Plain JavaScript. No frameworks, no libraries.
   ----------------------------------------------------------
   What this file does:
   1. Stores the 8 internship tasks as an array of objects
   2. Draws the task cards from that data (no hand-written cards)
   3. Lets the intern start, complete and reopen tasks
   4. Recalculates the progress numbers and the progress bar
   5. Filters the tasks by status
   6. Opens a details window for each task
   7. Runs the Technology Explorer (Next.js, Vue.js, Angular, Backend)
   Nothing here reloads the page.
   ========================================================== */

/* ---------- 1. THE DATA ---------- */

// A sample intern. Change these values to show a different intern.
const intern = {
    name: "Faithana",
    track: "Web Development Intern",
    welcome: "Good to see you again. Here is where your internship stands today."
};

const TOTAL_DAYS = 30;
const STORAGE_KEY = "techbridge-dashboard-progress";
const CHALLENGE_COUNT = 8;   // number of challenges in the Challenge Hub (Task 5)

// Every task is an object. "status" is one of: "Completed", "In Progress", "Not Started".
const tasks = [
    {
        number: 1, day: 1, status: "Completed",
        title: "Build the TechBridge Homepage",
        description: "Create the first version of the TechBridge website using HTML and CSS.",
        objective: "Build a responsive homepage that explains what TechBridge is, what it offers and how to apply.",
        skills: ["Semantic HTML", "CSS layout", "Responsive design"],
        produce: ["index.html and style.css", "A page that works on phone and desktop", "A live GitHub Pages link"],
        time: "3 to 4 hours",
        page: "index.html"
    },
    {
        number: 2, day: 4, status: "Completed",
        title: "Build the TechBridge Programs Experience",
        description: "Create a Programs page that presents the Data Analytics and Web Development programs.",
        objective: "Explain both programs clearly and help a visitor decide which one fits them.",
        skills: ["Page structure", "CSS grid and flexbox", "Tables and cards"],
        produce: ["programs.html", "A comparison of the two programs", "Navigation between pages"],
        time: "3 to 4 hours",
        page: "programs.html"
    },
    {
        number: 3, day: 8, status: "Completed",
        title: "Build the Internship Tasks Experience",
        description: "Present the 8 internship tasks and the 30-day journey in one easy-to-read page.",
        objective: "Show every task with its day and difficulty so a visitor understands the internship at a glance.",
        skills: ["Layout design", "Timelines", "Visual hierarchy"],
        produce: ["tasks.html", "A 30-day timeline", "Difficulty labels for every task"],
        time: "4 to 5 hours",
        page: "tasks.html"
    },
    {
        number: 4, day: 11, status: "Completed",
        title: "Build an Interactive Internship Roadmap",
        description: "Use JavaScript to let visitors switch between the two internship tracks.",
        objective: "Introduce JavaScript by showing the right 8 tasks when a track is chosen, without refreshing the page.",
        skills: ["Arrays and objects", "Event listeners", "DOM manipulation"],
        produce: ["roadmap.html and roadmap.js", "A track switcher", "A 30-day progress bar"],
        time: "4 to 5 hours",
        page: "roadmap.html"
    },
    {
        number: 5, day: 15, status: "Completed",
        title: "Build the Challenge Hub",
        description: "Create a hub of practical challenges that visitors can filter, search and explore.",
        objective: "Let visitors browse challenges by track and difficulty and open any challenge for more detail.",
        skills: ["Filtering", "Dynamic HTML", "Modal windows"],
        produce: ["challenge.html and challenge.js", "Track and difficulty filters", "A details window for every challenge"],
        time: "4 to 5 hours",
        page: "challenge.html"
    },
    {
        number: 6, day: 19, status: "In Progress",
        title: "Build the Intern Dashboard",
        description: "Track internship progress, tasks and modern web technologies in one interactive dashboard.",
        objective: "Turn the website into a working platform where an intern can see progress and update it.",
        skills: ["Progress calculations", "Conditional logic", "Interactive UI"],
        produce: ["dashboard.html and dashboard.js", "A task tracker that updates progress", "A Technology Explorer"],
        time: "4 to 6 hours",
        page: "dashboard.html"
    },
    {
        number: 7, day: 22, status: "Not Started",
        title: "Build the Task Submission System",
        description: "Create an interface where interns can prepare and submit their task work.",
        objective: "Give interns one place to describe their work, add their links and review it before submitting.",
        skills: ["Forms", "Validation", "User feedback"],
        produce: ["A submission form", "Clear error and success messages", "A preview of the work before sending"],
        time: "5 to 6 hours",
        page: ""
    },
    {
        number: 8, day: 26, status: "Not Started",
        title: "Build the Complete TechBridge Internship Platform",
        description: "Combine every component from the internship into one complete TechBridge platform.",
        objective: "Bring all pages together into one consistent, tested platform ready to show to others.",
        skills: ["Project organization", "Testing", "Polish and review"],
        produce: ["A complete multi-page platform", "Consistent design and navigation", "A final live website"],
        time: "6 to 8 hours",
        page: ""
    }
];

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

let currentFilter = "All";        // All, Completed, In Progress or Not Started
let toastTimer = null;            // used to hide the small message after a few seconds
let lastTaskNumber = null;        // the task whose details window was opened last

const statusList = ["Completed", "In Progress", "Not Started"];

const el = {
    internName:   document.getElementById("intern-name"),
    internTrack:  document.getElementById("intern-track"),
    welcomeText:  document.getElementById("welcome-text"),
    statusPill:   document.getElementById("status-pill"),
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

// "In Progress" -> "in-progress" (used in CSS class names)
function statusClass(status) {
    return status.toLowerCase().replace(" ", "-");
}

function findTask(number) {
    return tasks.find(function (task) { return task.number === number; });
}

/* ---------- 4. SAVING PROGRESS (Local Storage) ---------- */

// Save only the statuses. If the browser blocks storage, the dashboard still works.
function saveProgress() {
    try {
        const saved = {};
        tasks.forEach(function (task) { saved[task.number] = task.status; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (error) {
        /* storage not available: ignore */
    }
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return;
        }
        const saved = JSON.parse(raw);
        tasks.forEach(function (task) {
            if (statusList.includes(saved[task.number])) {
                task.status = saved[task.number];
            }
        });
    } catch (error) {
        /* damaged or blocked storage: keep the starting data */
    }
}

/* ---------- 5. PROGRESS CALCULATIONS ---------- */

function countByStatus(status) {
    return tasks.filter(function (task) { return task.status === status; }).length;
}

// Return every number the progress section needs, in one object.
function getProgress() {
    const total = tasks.length;
    const completed = countByStatus("Completed");
    const percent = Math.round((completed / total) * 1000) / 10;   // 5/8 -> 62.5
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
    if (progress.completed === progress.total) {
        return "Completed";
    } else if (progress.completed === 0 && countByStatus("In Progress") === 0) {
        return "Not Started";
    }
    return "In Progress";
}

// The task the intern should work on now: the In Progress one, else the first Not Started.
function getCurrentTask() {
    const working = tasks.find(function (task) { return task.status === "In Progress"; });
    if (working) {
        return working;
    }
    return tasks.find(function (task) { return task.status === "Not Started"; }) || null;
}

/* ---------- 6. DRAWING THE PAGE ---------- */

function renderWelcome() {
    el.internName.textContent = intern.name;
    el.internTrack.textContent = intern.track;
    el.welcomeText.textContent = intern.welcome;

    const status = getInternshipStatus();
    el.statusPill.textContent = status;
    el.statusPill.className = "status-pill is-" + statusClass(status);

    const current = getCurrentTask();
    if (current) {
        el.heroContinue.hidden = false;
        el.heroContinue.dataset.task = current.number;
        el.heroContinue.textContent = "Continue Task " + current.number;
    } else {
        el.heroContinue.hidden = true;
    }
}

function renderProgress() {
    const progress = getProgress();

    el.countDone.textContent = progress.completed;
    el.countTotal.textContent = progress.total;
    el.countLeft.textContent = progress.remaining;
    el.statTotal.textContent = progress.total;
    el.statDone.textContent = progress.completed;
    el.statLeft.textContent = progress.remaining;
    el.percent.textContent = progress.percent + "%";

    el.barFill.style.width = progress.percent + "%";
    el.bar.setAttribute("aria-valuenow", String(Math.round(progress.percent)));
    el.bar.setAttribute("aria-valuetext",
        progress.completed + " of " + progress.total + " tasks completed, " + progress.percent + " percent");

    // Conditional logic: celebrate when every task is done.
    el.celebration.hidden = progress.remaining !== 0;
}

function renderCurrentTask() {
    const current = getCurrentTask();
    el.current.replaceChildren();

    if (!current) {
        el.current.append(makeElement("p", "current-label", "All tasks complete"));
        el.current.append(makeElement("p", "current-title", "Nothing left to do. Well done."));
        return;
    }

    const label = current.status === "In Progress" ? "Current task" : "Up next";
    el.current.append(makeElement("p", "current-label", label));
    el.current.append(makeElement("p", "current-title", "Task " + current.number + ": " + current.title));

    const button = makeElement("button", "btn btn-small", current.status === "In Progress" ? "Continue Task" : "Start Task");
    button.type = "button";
    button.dataset.action = current.status === "In Progress" ? "view" : "start";
    button.dataset.task = current.number;
    el.current.append(button);
}

// A small status badge with an icon, so colour is never the only clue.
function makeStatusBadge(status) {
    const badge = makeElement("span", "status-badge is-" + statusClass(status));
    badge.append(makeElement("span", "status-icon"));
    badge.append(makeElement("span", "", status));
    return badge;
}

// The buttons shown on a card depend on the task's status.
function makeActionButton(task) {
    let label = "Start Task";
    let action = "start";
    let style = "btn btn-small btn-ghost-dark";

    if (task.status === "In Progress") {
        label = "Mark as Completed";
        action = "complete";
        style = "btn btn-small";
    } else if (task.status === "Completed") {
        label = "Reopen";
        action = "reopen";
        style = "btn btn-small btn-ghost-dark";
    }

    const button = makeElement("button", style, label);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.task = task.number;
    button.setAttribute("aria-label", label + ": Task " + task.number + ", " + task.title);
    return button;
}

function createTaskCard(task, position) {
    const item = makeElement("li", "task-item");
    item.style.setProperty("--i", position);

    const card = makeElement("article", "task-tile is-" + statusClass(task.status));
    card.id = "task-card-" + task.number;

    const top = makeElement("div", "tile-top");
    top.append(makeElement("span", "task-badge", "Task " + task.number));
    top.append(makeElement("span", "tile-day", "Day " + task.day));

    const view = makeElement("button", "btn btn-small btn-blue", "View Task");
    view.type = "button";
    view.dataset.action = "view";
    view.dataset.task = task.number;
    view.setAttribute("aria-label", "View Task " + task.number + ": " + task.title);

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

// Draw the task cards that pass the current filter.
function renderTasks() {
    // Filtering: keep every task when "All" is chosen, otherwise only matching ones.
    const visible = tasks.filter(function (task) {
        return currentFilter === "All" || task.status === currentFilter;
    });

    el.grid.replaceChildren();
    visible.forEach(function (task, index) {
        el.grid.append(createTaskCard(task, index));
    });

    el.empty.hidden = visible.length !== 0;
    el.grid.hidden = visible.length === 0;
    if (visible.length === 0) {
        el.empty.querySelector("p").textContent =
            "There are no tasks marked \"" + currentFilter + "\" right now.";
    }
}

// Update the filter buttons: highlight the chosen one and show counts.
function renderFilters() {
    el.filterBtns.forEach(function (button) {
        const value = button.dataset.value;
        const count = value === "All" ? tasks.length : countByStatus(value);
        button.setAttribute("aria-pressed", value === currentFilter ? "true" : "false");
        button.querySelector(".count").textContent = count;
    });
}

// Redraw everything that depends on the task data.
function refreshAll() {
    renderWelcome();
    renderProgress();
    renderCurrentTask();
    renderFilters();
    renderTasks();
}

/* ---------- 7. CHANGING A TASK'S STATUS ---------- */

function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        el.toast.classList.remove("is-visible");
    }, 3500);
}

// After a task is completed, make sure one task is In Progress (if any are left).
function startNextTaskIfNeeded() {
    if (countByStatus("In Progress") === 0) {
        const next = tasks.find(function (task) { return task.status === "Not Started"; });
        if (next) {
            next.status = "In Progress";
            return next;
        }
    }
    return null;
}

function setStatus(number, newStatus) {
    const task = findTask(number);
    if (!task || task.status === newStatus) {
        return;
    }

    task.status = newStatus;

    let message = "";
    if (newStatus === "Completed") {
        const next = startNextTaskIfNeeded();
        const progress = getProgress();
        message = "Task " + number + " completed. " + progress.completed + " of " + progress.total + " done (" + progress.percent + "%).";
        if (next) {
            message += " Task " + next.number + " is now in progress.";
        }
        if (progress.remaining === 0) {
            message = "All " + progress.total + " tasks completed. Congratulations!";
        }
    } else if (newStatus === "In Progress") {
        message = "Task " + number + " is now in progress.";
    } else {
        message = "Task " + number + " set to " + newStatus + ".";
    }

    saveProgress();
    refreshAll();
    showToast(message);
}

function resetProgress() {
    tasks.forEach(function (task) { task.status = task.startStatus; });
    saveProgress();
    refreshAll();
    showToast("Progress reset to the starting state.");
}

/* ---------- 8. TASK DETAILS WINDOW (MODAL) ---------- */

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

function openTask(number) {
    const task = findTask(number);
    if (!task) {
        return;
    }
    lastTaskNumber = number;
    el.dialog.dataset.status = statusClass(task.status);

    const top = makeElement("div", "tile-top");
    top.append(makeElement("span", "task-badge", "Task " + task.number));
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
    if (task.status === "Not Started") {
        actions.append(makeModalButton("Start Task", "start", task.number, "btn"));
    }
    if (task.status !== "Completed") {
        actions.append(makeModalButton("Mark as Completed", "complete", task.number, task.status === "In Progress" ? "btn" : "btn btn-blue"));
    } else {
        actions.append(makeModalButton("Reopen", "reopen", task.number, "btn btn-blue"));
    }
    if (task.page !== "") {
        const open = makeElement("a", "btn btn-ghost-dark", "Open this page");
        open.href = task.page;
        actions.append(open);
    }
    const close = makeElement("button", "btn btn-ghost-dark", "Close");
    close.type = "button";
    close.dataset.close = "true";
    actions.append(close);

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

    // If the window is already open (status changed inside it), just refresh its content.
    if (!el.dialog.open) {
        document.body.classList.add("modal-open");
        el.dialog.showModal();
        el.dialog.scrollTop = 0;
    }
}

function makeModalButton(label, action, number, style) {
    const button = makeElement("button", style, label);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.task = number;
    button.dataset.fromDialog = "true";
    return button;
}

/* ---------- 9. TECHNOLOGY EXPLORER ---------- */

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

/* ---------- 10. EVENT LISTENERS ---------- */

// Filter buttons
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
    if (!button) {
        return;
    }
    const number = Number(button.dataset.task);
    const action = button.dataset.action;

    if (action === "view") {
        openTask(number);
        return;
    }

    if (action === "start") {
        setStatus(number, "In Progress");
    } else if (action === "complete") {
        setStatus(number, "Completed");
    } else if (action === "reopen") {
        setStatus(number, "In Progress");
    }

    // If this came from the details window, refresh it so the buttons match the new status.
    if (button.dataset.fromDialog === "true") {
        openTask(number);
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
    document.body.classList.remove("modal-open");
    // Return keyboard focus to the View Task button of the task that was open.
    const back = el.grid.querySelector('button[data-action="view"][data-task="' + lastTaskNumber + '"]');
    if (back) {
        back.focus();
    }
});

// "Continue Task" button in the welcome section
el.heroContinue.addEventListener("click", function () {
    const number = Number(el.heroContinue.dataset.task);
    openTask(number);
});

el.resetBtn.addEventListener("click", resetProgress);

// Technology Explorer buttons
el.techButtons.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-tech]");
    if (button) {
        showTechnology(button.dataset.tech);
    }
});

/* ---------- START ---------- */

// Remember each task's starting status so Reset can put it back.
tasks.forEach(function (task) { task.startStatus = task.status; });

loadProgress();
el.challengeCount.textContent = CHALLENGE_COUNT;
renderTechButtons();
showTechnology("nextjs");
refreshAll();