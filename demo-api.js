/* ==========================================================
   TechBridge | Demo API (browser only)
   ----------------------------------------------------------
   GitHub Pages and other static hosts cannot run Node.js, so the real
   backend (backend/server.js) is not available there. This file pretends
   to be that backend inside the browser, so the hosted dashboard still works.

   It answers the same endpoints, with the same rules, as server.js:
     GET /api/health, GET /api/tasks, GET /api/tasks/:id,
     PUT /api/tasks/:id, POST /api/reset

   The dashboard only uses this when it is hosted (not on localhost) or when
   the visitor clicks "Use demo mode". With the real backend running,
   this file is never used.
   The data below is a copy of backend/data/tasks.json.
   ========================================================== */

(function () {
    const DEMO_DELAY_MS = 400;
    const VALID_STATUSES = ["completed", "in-progress", "not-started"];

    const startingTasks = [
      {
        "id": 1,
        "title": "Build the TechBridge Homepage",
        "description": "Create the first version of the TechBridge website using HTML and CSS.",
        "status": "completed",
        "day": 1,
        "objective": "Build a responsive homepage that explains what TechBridge is, what it offers and how to apply.",
        "skills": ["Semantic HTML", "CSS layout", "Responsive design"],
        "produce": ["index.html and style.css", "A page that works on phone and desktop", "A live GitHub Pages link"],
        "time": "3 to 4 hours",
        "page": "index.html"
      },
      {
        "id": 2,
        "title": "Build the TechBridge Programs Experience",
        "description": "Create a Programs page that presents the Data Analytics and Web Development programs.",
        "status": "completed",
        "day": 4,
        "objective": "Explain both programs clearly and help a visitor decide which one fits them.",
        "skills": ["Page structure", "CSS grid and flexbox", "Tables and cards"],
        "produce": ["programs.html", "A comparison of the two programs", "Navigation between pages"],
        "time": "3 to 4 hours",
        "page": "programs.html"
      },
      {
        "id": 3,
        "title": "Build the Internship Tasks Experience",
        "description": "Present the 8 internship tasks and the 30-day journey in one easy-to-read page.",
        "status": "completed",
        "day": 8,
        "objective": "Show every task with its day and difficulty so a visitor understands the internship at a glance.",
        "skills": ["Layout design", "Timelines", "Visual hierarchy"],
        "produce": ["tasks.html", "A 30-day timeline", "Difficulty labels for every task"],
        "time": "4 to 5 hours",
        "page": "tasks.html"
      },
      {
        "id": 4,
        "title": "Build an Interactive Internship Roadmap",
        "description": "Use JavaScript to let visitors switch between the two internship tracks.",
        "status": "completed",
        "day": 11,
        "objective": "Introduce JavaScript by showing the right 8 tasks when a track is chosen, without refreshing the page.",
        "skills": ["Arrays and objects", "Event listeners", "DOM manipulation"],
        "produce": ["roadmap.html and roadmap.js", "A track switcher", "A 30-day progress bar"],
        "time": "4 to 5 hours",
        "page": "roadmap.html"
      },
      {
        "id": 5,
        "title": "Build the Challenge Hub",
        "description": "Create a hub of practical challenges that visitors can filter, search and explore.",
        "status": "completed",
        "day": 15,
        "objective": "Let visitors browse challenges by track and difficulty and open any challenge for more detail.",
        "skills": ["Filtering", "Dynamic HTML", "Modal windows"],
        "produce": ["challenge.html and challenge.js", "Track and difficulty filters", "A details window for every challenge"],
        "time": "4 to 5 hours",
        "page": "challenge.html"
      },
      {
        "id": 6,
        "title": "Build the Intern Dashboard",
        "description": "Track internship progress, tasks and modern web technologies in one interactive dashboard.",
        "status": "completed",
        "day": 19,
        "objective": "Turn the website into a working platform where an intern can see progress and update it.",
        "skills": ["Progress calculations", "Conditional logic", "Interactive UI"],
        "produce": ["dashboard.html and dashboard.js", "A task tracker that updates progress", "A Technology Explorer"],
        "time": "4 to 6 hours",
        "page": "dashboard.html"
      },
      {
        "id": 7,
        "title": "Build a TechBridge Task Management API",
        "description": "Create a Node.js and Express backend and connect the dashboard to it with fetch().",
        "status": "in-progress",
        "day": 22,
        "objective": "Move the task data out of the webpage and into a backend API that the dashboard requests, displays and updates.",
        "skills": ["Node.js and Express.js", "REST API endpoints", "fetch(), loading states and error handling"],
        "produce": ["backend/server.js and data/tasks.json", "GET and PUT endpoints for tasks", "A dashboard that loads and updates tasks through the API"],
        "time": "4 to 6 hours",
        "page": "dashboard.html"
      },
      {
        "id": 8,
        "title": "Build the Complete TechBridge Internship Platform",
        "description": "Combine every component from the internship into one complete TechBridge platform.",
        "status": "not-started",
        "day": 26,
        "objective": "Bring all pages and the backend together into one consistent, tested platform ready to show to others.",
        "skills": ["Project organization", "Testing", "Polish and review"],
        "produce": ["A complete multi-page platform", "Consistent design and navigation", "A final live website"],
        "time": "6 to 8 hours",
        "page": ""
      }
    ];

    let tasks = JSON.parse(JSON.stringify(startingTasks));

    function fail(status, message) {
        const error = new Error(message);
        error.status = status;
        return error;
    }

    function parseId(value) {
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    }

    // Same job as the routes in server.js, but it returns data instead of sending a response.
    function handle(method, path, body) {
        if (method === "GET" && path === "/api/health") {
            return { status: "ok" };
        }
        if (method === "GET" && path === "/api/tasks") {
            return JSON.parse(JSON.stringify(tasks));
        }
        if (method === "POST" && path === "/api/reset") {
            tasks = JSON.parse(JSON.stringify(startingTasks));
            return JSON.parse(JSON.stringify(tasks));
        }

        const match = path.match(/^\/api\/tasks\/([^/]+)$/);
        if (match && (method === "GET" || method === "PUT")) {
            const id = parseId(match[1]);
            if (id === null) {
                throw fail(400, "The task id must be a whole number, like 3.");
            }
            const task = tasks.find(function (item) { return item.id === id; });
            if (!task) {
                throw fail(404, "Task " + id + " was not found.");
            }

            if (method === "GET") {
                return JSON.parse(JSON.stringify(task));
            }

            const status = body ? body.status : undefined;
            if (!VALID_STATUSES.includes(status)) {
                throw fail(400, "The status must be one of: " + VALID_STATUSES.join(", ") + ".");
            }
            task.status = status;
            if (status === "completed") {
                const working = tasks.some(function (item) { return item.status === "in-progress"; });
                if (!working) {
                    const next = tasks.find(function (item) { return item.status === "not-started"; });
                    if (next) {
                        next.status = "in-progress";
                    }
                }
            }
            return JSON.parse(JSON.stringify(task));
        }

        throw fail(404, "That API endpoint does not exist.");
    }

    // Returns a Promise, like fetch(), after a short pause.
    window.TechBridgeDemoApi = {
        request: function (method, path, body) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        resolve(handle(method, path, body));
                    } catch (error) {
                        reject(error);
                    }
                }, DEMO_DELAY_MS);
            });
        }
    };
})();