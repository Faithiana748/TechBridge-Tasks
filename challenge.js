/* ==========================================================
   TechBridge | Challenge Hub (Task 5)
   Plain JavaScript. No frameworks, no libraries.
   ----------------------------------------------------------
   What this file does:
   1. Loads the challenges from the backend API (GET /api/challenges)
   2. Filters them by track, difficulty and search words
   3. Sorts them (default order, easiest first, hardest first)
   4. Draws the cards and the "no results" message
   5. Opens a details window (modal) for a challenge
   Nothing here reloads the page.
   ========================================================== */

/* ---------- 1. THE DATA ---------- */

// Each challenge is an object. "level" is 1, 2 or 3 and is used for sorting.
// The challenges come from the backend (GET /api/challenges). They are filled in by loadChallenges().
let challenges = [];


/* ---------- 2. VARIABLES: what the visitor has chosen ---------- */

// The current filter settings. Every change updates this object, then redraws.
const filters = {
    track: "All",        // All, Data Analytics or Web Development
    difficulty: "All",   // All, Beginner, Intermediate or Advanced
    search: "",          // words typed in the search box
    sort: "default"      // default, easiest or hardest
};

const grid          = document.getElementById("challenge-grid");
const countText     = document.getElementById("result-count");
const noResults     = document.getElementById("no-results");
const searchBox     = document.getElementById("search");
const sortSelect    = document.getElementById("sort");
const filterButtons = document.querySelectorAll(".chip[data-filter]");
const resetButtons  = document.querySelectorAll("[data-reset]");

const dialog        = document.getElementById("challenge-dialog");
const dialogContent = document.getElementById("dialog-content");

let lastOpenerButton = null;   // remembers which button opened the dialog
let loadState = "loading";     // "loading", "ready" or "error"
let lastError = null;          // the last error from the API

const loadingBox    = document.getElementById("challenge-loading");
const errorBox      = document.getElementById("challenge-error");
const errorHint     = document.getElementById("challenge-error-hint");
const retryButton   = document.getElementById("retry-challenges");
const demoButton    = document.getElementById("use-demo-challenges");
const demoNote      = document.getElementById("demo-note");

/* ---------- 3. FUNCTIONS ---------- */

// Make an element with a class and some text (textContent is safe from HTML tricks).
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

// A short class name for a track, used by the CSS for colours.
function trackClass(track) {
    if (track === "Data Analytics") {
        return "track-data";
    }
    return "track-web";
}

// Does this challenge pass every active filter?
function matchesFilters(challenge) {
    // Track filter
    if (filters.track !== "All" && challenge.track !== filters.track) {
        return false;
    }
    // Difficulty filter
    if (filters.difficulty !== "All" && challenge.difficulty !== filters.difficulty) {
        return false;
    }
    // Search filter: every typed word must appear somewhere in the challenge
    if (filters.search !== "") {
        const text = (challenge.name + " " + challenge.description + " " +
                      challenge.track + " " + challenge.skills.join(" ")).toLowerCase();
        const words = filters.search.toLowerCase().split(" ");
        for (const word of words) {
            if (word !== "" && !text.includes(word)) {
                return false;
            }
        }
    }
    return true;
}

// Get the challenges to show: filter first, then sort.
function getVisibleChallenges() {
    const visible = challenges.filter(matchesFilters);

    if (filters.sort === "easiest") {
        visible.sort(function (a, b) { return a.level - b.level; });
    } else if (filters.sort === "hardest") {
        visible.sort(function (a, b) { return b.level - a.level; });
    }
    return visible;
}

// The 3-step difficulty meter (1, 2 or 3 filled).
function makeMeter(level) {
    const meter = makeElement("span", "meter lvl-" + level);
    meter.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) {
        meter.append(document.createElement("i"));
    }
    return meter;
}

// Build one challenge card.
function createCard(challenge, position) {
    const item = makeElement("li", "challenge " + trackClass(challenge.track));
    item.style.setProperty("--i", position);   // staggers the fade-in

    const card = makeElement("article", "challenge-card");
    card.setAttribute("aria-labelledby", "title-" + challenge.id);

    const top = makeElement("div", "challenge-top");
    top.append(makeElement("span", "track-tag " + trackClass(challenge.track), challenge.track));

    const level = makeElement("span", "difficulty");
    level.append(makeMeter(challenge.level));
    level.append(makeElement("span", "", challenge.difficulty));
    top.append(level);

    const title = makeElement("h3", "", challenge.name);
    title.id = "title-" + challenge.id;

    const outcome = makeElement("div", "outcome");
    outcome.append(makeElement("span", "outcome-label", "Expected outcome"));
    outcome.append(makeElement("p", "", challenge.outcome));

    const button = makeElement("button", "btn btn-blue view-btn", "View Challenge");
    button.type = "button";
    button.dataset.id = challenge.id;
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-label", "View Challenge: " + challenge.name);

    card.append(top, title, makeElement("p", "challenge-desc", challenge.description), outcome, button);
    item.append(card);
    return item;
}

// Draw the cards, the count and the "no results" message.
function renderChallenges() {
    // Until the challenges have loaded, show only the loading or error message.
    loadingBox.hidden = loadState !== "loading";
    errorBox.hidden = loadState !== "error";
    demoNote.hidden = !window.TechBridgeApi.isDemo();
    if (loadState === "error") {
        errorHint.textContent = lastError ? window.TechBridgeApi.describeError(lastError) : "";
        demoButton.hidden = window.TechBridgeApi.isDemo();
    }
    if (loadState !== "ready") {
        grid.replaceChildren();
        grid.hidden = true;
        noResults.hidden = true;
        countText.textContent = "";
        return;
    }

    const visible = getVisibleChallenges();

    grid.replaceChildren();
    visible.forEach(function (challenge, index) {
        grid.append(createCard(challenge, index));
    });

    // Conditional logic: say how many are showing
    if (visible.length === challenges.length) {
        countText.textContent = "Showing all " + challenges.length + " challenges";
    } else if (visible.length === 1) {
        countText.textContent = "Showing 1 of " + challenges.length + " challenges";
    } else {
        countText.textContent = "Showing " + visible.length + " of " + challenges.length + " challenges";
    }

    // Show the friendly message when nothing matches
    noResults.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
}

// Highlight the chosen filter buttons.
function updateFilterButtons() {
    filterButtons.forEach(function (button) {
        const group = button.dataset.filter;          // "track" or "difficulty"
        const isSelected = filters[group] === button.dataset.value;
        button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
}

// Are any filters switched on? (used to show the Reset button)
function filtersAreActive() {
    return filters.track !== "All" || filters.difficulty !== "All" ||
           filters.search !== "" || filters.sort !== "default";
}

// Redraw everything after any change.
function refresh() {
    updateFilterButtons();
    renderChallenges();
    resetButtons.forEach(function (button) {
        if (button.dataset.reset === "bar") {
            button.hidden = !filtersAreActive();
        }
    });
}

// Put every filter back to its starting value.
function resetFilters() {
    filters.track = "All";
    filters.difficulty = "All";
    filters.search = "";
    filters.sort = "default";
    searchBox.value = "";
    sortSelect.value = "default";
    refresh();
}

/* ---------- THE DETAILS WINDOW (MODAL) ---------- */

// Add a labelled list (skills, tools, items to produce) to the dialog.
function makeList(className, items) {
    const list = makeElement("ul", className);
    items.forEach(function (text) {
        list.append(makeElement("li", "", text));
    });
    return list;
}

// One heading + content block inside the dialog.
function makeBlock(label, content) {
    const block = makeElement("section", "detail-block");
    block.append(makeElement("h3", "", label));
    block.append(content);
    return block;
}

function openChallenge(id, openerButton) {
    // Find the challenge object that matches the clicked button.
    const challenge = challenges.find(function (item) { return item.id === id; });
    if (!challenge) {
        return;
    }

    lastOpenerButton = openerButton;
    dialog.dataset.track = trackClass(challenge.track);

    const top = makeElement("div", "challenge-top");
    top.append(makeElement("span", "track-tag " + trackClass(challenge.track), challenge.track));
    const level = makeElement("span", "difficulty");
    level.append(makeMeter(challenge.level));
    level.append(makeElement("span", "", challenge.difficulty));
    top.append(level);

    const title = makeElement("h2", "", challenge.name);
    title.id = "dialog-title";

    const facts = makeElement("dl", "facts");
    const time = makeElement("div", "fact");
    time.append(makeElement("dt", "", "Estimated time"), makeElement("dd", "", challenge.time));
    const level2 = makeElement("div", "fact");
    level2.append(makeElement("dt", "", "Difficulty"), makeElement("dd", "", challenge.difficulty));
    facts.append(time, level2);

    const apply = makeElement("a", "btn", "Apply for the internship");
    apply.href = "https://forms.gle/8EbdSy5ttGfLZfjv5";
    apply.target = "_blank";
    apply.rel = "noopener";

    const close = makeElement("button", "btn btn-ghost-dark", "Close");
    close.type = "button";
    close.dataset.close = "true";

    const actions = makeElement("div", "actions");
    actions.append(apply, close);

    dialogContent.replaceChildren(
        top,
        title,
        makeElement("p", "dialog-lead", challenge.description),
        facts,
        makeBlock("Objective", makeElement("p", "", challenge.objective)),
        makeBlock("Skills required", makeList("chips-list", challenge.skills)),
        makeBlock("Tools you may use", makeList("chips-list", challenge.tools)),
        makeBlock("What you need to produce", makeList("bullet-list", challenge.produce)),
        makeBlock("Expected result", makeElement("p", "", challenge.outcome)),
        actions
    );

    document.body.classList.add("modal-open");
    dialog.showModal();
    dialog.scrollTop = 0;
}

function closeChallenge() {
    dialog.close();
}

/* ---------- 4. EVENT LISTENERS ---------- */

// Track and difficulty buttons
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        filters[button.dataset.filter] = button.dataset.value;
        refresh();
    });
});

// Search box: filter while the visitor types
searchBox.addEventListener("input", function () {
    filters.search = searchBox.value.trim();
    refresh();
});

// Sort menu
sortSelect.addEventListener("change", function () {
    filters.sort = sortSelect.value;
    refresh();
});

// Reset buttons (one in the filter bar, one in the "no results" message)
resetButtons.forEach(function (button) {
    button.addEventListener("click", resetFilters);
});

// "View Challenge" buttons. One listener on the grid handles every card.
grid.addEventListener("click", function (event) {
    const button = event.target.closest(".view-btn");
    if (button) {
        openChallenge(button.dataset.id, button);
    }
});

// Close button inside the dialog, or a click on the dark backdrop
dialog.addEventListener("click", function (event) {
    if (event.target.closest("[data-close]")) {
        closeChallenge();
        return;
    }
    if (event.target === dialog) {       // clicked outside the white box
        closeChallenge();
    }
});

// Runs for the Close button, the Escape key and the backdrop.
dialog.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (lastOpenerButton && document.body.contains(lastOpenerButton)) {
        lastOpenerButton.focus();        // return focus to the button that opened it
    }
});

/* ---------- LOADING FROM THE API (GET /api/challenges) ---------- */

async function loadChallenges() {
    loadState = "loading";
    refresh();
    try {
        challenges = await window.TechBridgeApi.request("/api/challenges");
        loadState = "ready";
        lastError = null;
    } catch (error) {
        lastError = error;
        loadState = "error";
    }
    refresh();

    // A link from the Search page can ask for one challenge to be opened: challenge.html?open=sales-analysis
    const wanted = new URLSearchParams(window.location.search).get("open");
    if (loadState === "ready" && wanted) {
        openChallenge(wanted, null);
    }
}

retryButton.addEventListener("click", loadChallenges);
demoButton.addEventListener("click", function () {
    window.TechBridgeApi.setDemo(true);
    loadChallenges();
});

/* ---------- START ---------- */

loadChallenges();