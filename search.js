/* ==========================================================
   TechBridge | Search (Task 8)
   Plain JavaScript. No frameworks, no libraries.
   ----------------------------------------------------------
   What this file does:
   1. Reads what the visitor types (or the ?q= word in the address)
   2. Asks the backend:  GET /api/search?q=word
   3. Shows matching tasks and challenges, with the matched words highlighted
   4. Shows a loading message, an error message, or "No matching results found."
   Nothing here reloads the page.
   ========================================================== */

/* ---------- 1. THINGS ON THE PAGE ---------- */

const STATUS_LABELS = {
    "completed": "Completed",
    "in-progress": "In Progress",
    "not-started": "Not Started"
};

const el = {
    form:        document.getElementById("search-form"),
    input:       document.getElementById("q"),
    suggestions: document.getElementById("suggestions"),
    filterBar:   document.getElementById("search-filter"),
    filterBtns:  document.querySelectorAll("[data-show]"),
    countAll:    document.getElementById("count-all"),
    countTasks:  document.getElementById("count-tasks"),
    countChall:  document.getElementById("count-challenges"),
    demoNote:    document.getElementById("demo-note"),
    status:      document.getElementById("search-status"),
    loading:     document.getElementById("search-loading"),
    errorBox:    document.getElementById("search-error"),
    errorHint:   document.getElementById("search-error-hint"),
    retry:       document.getElementById("retry-search"),
    useDemo:     document.getElementById("use-demo-search"),
    empty:       document.getElementById("search-empty"),
    groupTasks:  document.getElementById("group-tasks"),
    groupChall:  document.getElementById("group-challenges"),
    listTasks:   document.getElementById("list-tasks"),
    listChall:   document.getElementById("list-challenges"),
    countTasksH: document.getElementById("group-tasks-count"),
    countChallH: document.getElementById("group-challenges-count")
};

/* ---------- 2. VARIABLES: what the page remembers ---------- */

let viewState = "idle";       // "idle", "loading", "error" or "results"
let currentQuery = "";        // the words being searched
let results = { tasks: [], challenges: [] };
let show = "all";             // all, tasks or challenges
let lastError = null;
let requestId = 0;            // stops an old answer replacing a newer one
let typingTimer = null;

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

// Text with the searched words wrapped in <mark>. Built from nodes, never from HTML strings.
function highlight(text, words) {
    const fragment = document.createDocumentFragment();
    if (words.length === 0) {
        fragment.append(text);
        return fragment;
    }
    const escaped = words.map(function (word) { return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
    const pattern = new RegExp("(" + escaped.join("|") + ")", "gi");
    text.split(pattern).forEach(function (part, index) {
        // With a capture group, every odd piece is a match.
        if (index % 2 === 1) {
            fragment.append(makeElement("mark", "", part));
        } else if (part !== "") {
            fragment.append(part);
        }
    });
    return fragment;
}

function searchWords() {
    return currentQuery.toLowerCase().split(/\s+/).filter(function (word) { return word !== ""; });
}

/* ---------- 4. TALKING TO THE API (GET /api/search?q=word) ---------- */

async function runSearch(query) {
    currentQuery = query.trim();
    const thisRequest = ++requestId;

    // Keep the address in step with the search, so the page can be shared or refreshed.
    const url = new URL(window.location.href);
    if (currentQuery === "") {
        url.searchParams.delete("q");
    } else {
        url.searchParams.set("q", currentQuery);
    }
    try {
        window.history.replaceState(null, "", url);
    } catch (historyError) {
        // Some browsers block this for local files. The search still works.
    }

    if (currentQuery === "") {
        viewState = "idle";
        results = { tasks: [], challenges: [] };
        render();
        return;
    }

    viewState = "loading";
    render();

    try {
        const data = await window.TechBridgeApi.request("/api/search?q=" + encodeURIComponent(currentQuery));
        if (thisRequest !== requestId) {
            return;                       // a newer search has started
        }
        results = { tasks: data.tasks, challenges: data.challenges };
        viewState = "results";
        lastError = null;
    } catch (error) {
        if (thisRequest !== requestId) {
            return;
        }
        lastError = error;
        viewState = "error";
    }
    render();
}

/* ---------- 5. DRAWING THE PAGE ---------- */

function makeStatusBadge(status) {
    const badge = makeElement("span", "status-badge is-" + status);
    badge.append(makeElement("span", "status-icon"));
    badge.append(makeElement("span", "", STATUS_LABELS[status]));
    return badge;
}

function createTaskResult(task, words) {
    const item = makeElement("li", "result-item");
    const card = makeElement("article", "result-card");

    const top = makeElement("div", "tile-top");
    top.append(makeElement("span", "task-badge", "Task " + task.id));
    top.append(makeElement("span", "tile-day", "Day " + task.day));

    const title = makeElement("h3");
    title.append(highlight(task.title, words));
    const desc = makeElement("p", "tile-desc");
    desc.append(highlight(task.description, words));

    const link = makeElement("a", "btn btn-small btn-blue", "View Task");
    link.href = "dashboard.html?task=" + task.id;
    link.setAttribute("aria-label", "View Task " + task.id + ": " + task.title);

    card.append(top, title, desc, makeStatusBadge(task.status), link);
    item.append(card);
    return item;
}

function createChallengeResult(challenge, words) {
    const trackClass = challenge.track === "Data Analytics" ? "track-data" : "track-web";
    const item = makeElement("li", "result-item");
    const card = makeElement("article", "result-card");

    const top = makeElement("div", "challenge-top");
    top.append(makeElement("span", "track-tag " + trackClass, challenge.track));
    top.append(makeElement("span", "difficulty", challenge.difficulty));

    const title = makeElement("h3");
    title.append(highlight(challenge.name, words));
    const desc = makeElement("p", "tile-desc");
    desc.append(highlight(challenge.description, words));

    const link = makeElement("a", "btn btn-small btn-blue", "View Challenge");
    link.href = "challenge.html?open=" + encodeURIComponent(challenge.id);
    link.setAttribute("aria-label", "View Challenge: " + challenge.name);

    card.append(top, title, desc, link);
    item.append(card);
    return item;
}

function render() {
    const ready = viewState === "results";
    const taskCount = ready ? results.tasks.length : 0;
    const challengeCount = ready ? results.challenges.length : 0;
    const total = taskCount + challengeCount;
    const words = searchWords();

    el.demoNote.hidden = !window.TechBridgeApi.isDemo();
    el.loading.hidden = viewState !== "loading";
    el.errorBox.hidden = viewState !== "error";
    if (viewState === "error") {
        el.errorHint.textContent = lastError ? window.TechBridgeApi.describeError(lastError) : "";
        el.useDemo.hidden = window.TechBridgeApi.isDemo();
    }

    // The suggestion chips are for when nothing has been searched yet.
    el.suggestions.hidden = viewState !== "idle";

    // The All / Tasks / Challenges buttons are only useful when there are results.
    el.filterBar.hidden = !(ready && total > 0);
    el.countAll.textContent = total;
    el.countTasks.textContent = taskCount;
    el.countChall.textContent = challengeCount;
    el.filterBtns.forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.show === show ? "true" : "false");
    });

    // The sentence that tells the visitor what is happening.
    if (viewState === "idle") {
        el.status.textContent = "Type a word above to search.";
    } else if (viewState === "loading") {
        el.status.textContent = "";
    } else if (viewState === "error") {
        el.status.textContent = "";
    } else if (total === 0) {
        el.status.textContent = "";
    } else {
        el.status.textContent = total + (total === 1 ? " result" : " results") + " for \"" + currentQuery + "\"";
    }

    el.empty.hidden = !(ready && total === 0);

    // Tasks group
    const showTasks = ready && taskCount > 0 && (show === "all" || show === "tasks");
    el.groupTasks.hidden = !showTasks;
    el.listTasks.replaceChildren();
    if (showTasks) {
        el.countTasksH.textContent = "(" + taskCount + ")";
        results.tasks.forEach(function (task) { el.listTasks.append(createTaskResult(task, words)); });
    }

    // Challenges group
    const showChallenges = ready && challengeCount > 0 && (show === "all" || show === "challenges");
    el.groupChall.hidden = !showChallenges;
    el.listChall.replaceChildren();
    if (showChallenges) {
        el.countChallH.textContent = "(" + challengeCount + ")";
        results.challenges.forEach(function (challenge) { el.listChall.append(createChallengeResult(challenge, words)); });
    }
}

/* ---------- 6. EVENT LISTENERS ---------- */

// Search while the visitor types (after a short pause, so the server is not asked for every key).
el.input.addEventListener("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () { runSearch(el.input.value); }, 300);
});

// Pressing Enter or the Search button searches straight away.
el.form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearTimeout(typingTimer);
    runSearch(el.input.value);
});

// Suggestion chips
el.suggestions.addEventListener("click", function (event) {
    const button = event.target.closest("[data-suggest]");
    if (button) {
        el.input.value = button.dataset.suggest;
        runSearch(button.dataset.suggest);
    }
});

// All / Tasks / Challenges
el.filterBtns.forEach(function (button) {
    button.addEventListener("click", function () {
        show = button.dataset.show;
        render();
    });
});

el.retry.addEventListener("click", function () { runSearch(currentQuery); });
el.useDemo.addEventListener("click", function () {
    window.TechBridgeApi.setDemo(true);
    runSearch(currentQuery);
});

/* ---------- START ---------- */

// A link like search.html?q=javascript searches straight away.
const startWord = new URLSearchParams(window.location.search).get("q");
if (startWord) {
    el.input.value = startWord;
    runSearch(startWord);
} else {
    render();
}