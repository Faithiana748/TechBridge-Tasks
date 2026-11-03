/* ==========================================================
   TechBridge | Demo API (browser only)
   ----------------------------------------------------------
   GitHub Pages and other static hosts cannot run Node.js, so the real
   backend (backend/server.js) is not available there. This file pretends
   to be that backend inside the browser, so the hosted platform still works.

   It answers the same endpoints, with the same rules, as the backend:
     GET /api/health
     GET /api/tasks, GET /api/tasks/:id, PUT /api/tasks/:id
     GET /api/challenges, GET /api/challenges/:id
     GET /api/search?q=word
     POST /api/reset

   The pages only use this when they are hosted (not on localhost) or when
   the visitor clicks "Use demo mode". With the real backend running,
   this file is never used.
   The data below is a copy of backend/data/tasks.json and backend/data/challenges.json.
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
        "skills": [
          "Semantic HTML",
          "CSS layout",
          "Responsive design"
        ],
        "produce": [
          "index.html and style.css",
          "A page that works on phone and desktop",
          "A live GitHub Pages link"
        ],
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
        "skills": [
          "Page structure",
          "CSS grid and flexbox",
          "Tables and cards"
        ],
        "produce": [
          "programs.html",
          "A comparison of the two programs",
          "Navigation between pages"
        ],
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
        "skills": [
          "Layout design",
          "Timelines",
          "Visual hierarchy"
        ],
        "produce": [
          "tasks.html",
          "A 30-day timeline",
          "Difficulty labels for every task"
        ],
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
        "skills": [
          "Arrays and objects",
          "Event listeners",
          "DOM manipulation"
        ],
        "produce": [
          "roadmap.html and roadmap.js",
          "A track switcher",
          "A 30-day progress bar"
        ],
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
        "skills": [
          "Filtering",
          "Dynamic HTML",
          "Modal windows"
        ],
        "produce": [
          "challenge.html and challenge.js",
          "Track and difficulty filters",
          "A details window for every challenge"
        ],
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
        "skills": [
          "Progress calculations",
          "Conditional logic",
          "Interactive UI"
        ],
        "produce": [
          "dashboard.html and dashboard.js",
          "A task tracker that updates progress",
          "A Technology Explorer"
        ],
        "time": "4 to 6 hours",
        "page": "dashboard.html"
      },
      {
        "id": 7,
        "title": "Build a TechBridge Task Management API",
        "description": "Create a Node.js and Express backend and connect the dashboard to it with fetch().",
        "status": "completed",
        "day": 22,
        "objective": "Move the task data out of the webpage and into a backend API that the dashboard requests, displays and updates.",
        "skills": [
          "Node.js and Express.js",
          "REST API endpoints",
          "fetch(), loading states and error handling"
        ],
        "produce": [
          "backend/server.js and data/tasks.json",
          "GET and PUT endpoints for tasks",
          "A dashboard that loads and updates tasks through the API"
        ],
        "time": "4 to 6 hours",
        "page": "dashboard.html"
      },
      {
        "id": 8,
        "title": "Build the TechBridge Intern Management Platform",
        "description": "Combine the dashboard, the Challenge Hub, search and the Express API into one complete TechBridge platform.",
        "status": "in-progress",
        "day": 26,
        "objective": "Bring every part of the internship into one consistent, tested platform: pages, API, search, task management and documentation.",
        "skills": [
          "Project organization",
          "Testing",
          "Documentation and deployment"
        ],
        "produce": [
          "A complete multi-page platform",
          "Frontend connected to the backend API",
          "A README, a GitHub repository and a live website"
        ],
        "time": "6 to 8 hours",
        "page": "index.html"
      }
    ];

    const challenges = [
      {
        "id": "sales-analysis",
        "name": "Small Shop Sales Analysis",
        "track": "Data Analytics",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Analyze three months of sales from a small shop and find out what sells best.",
        "outcome": "A short summary sheet showing total sales, the best-selling products and the best sales day.",
        "objective": "Use a small sales dataset to answer simple business questions: what sold the most, when, and for how much.",
        "skills": [
          "Data cleaning",
          "Formulas",
          "Pivot Tables"
        ],
        "tools": [
          "Google Sheets",
          "Microsoft Excel"
        ],
        "produce": [
          "A cleaned sales spreadsheet",
          "A Pivot Table of sales by product",
          "A summary of three findings, in plain language"
        ],
        "time": "3 to 4 hours"
      },
      {
        "id": "expense-analysis",
        "name": "Personal Expense Analysis",
        "track": "Data Analytics",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Organize a month of expenses into categories and see where the money goes.",
        "outcome": "A clear table and a chart showing spending by category, with a note on the biggest cost.",
        "objective": "Turn a messy list of expenses into categories, totals and one chart that anyone can read.",
        "skills": [
          "Data cleaning",
          "SUM and SUMIF formulas",
          "Basic charts"
        ],
        "tools": [
          "Google Sheets",
          "Microsoft Excel"
        ],
        "produce": [
          "A tidy expense table with categories",
          "A pie or bar chart of spending by category",
          "One paragraph on what you would cut first"
        ],
        "time": "2 to 3 hours"
      },
      {
        "id": "churn-analysis",
        "name": "Customer Churn Analysis",
        "track": "Data Analytics",
        "difficulty": "Intermediate",
        "level": 2,
        "description": "Study customer records to find out who stopped buying and what they had in common.",
        "outcome": "A short report that names the customer groups most likely to leave and suggests one way to keep them.",
        "objective": "Combine two related tables, measure how many customers left, and look for patterns behind it.",
        "skills": [
          "SQL JOIN and GROUP BY",
          "Lookup functions",
          "Percentages and rates"
        ],
        "tools": [
          "SQL (SQLite or MySQL)",
          "Google Sheets"
        ],
        "produce": [
          "A SQL query that counts customers who left",
          "A table comparing groups of customers",
          "A one-page recommendation"
        ],
        "time": "4 to 5 hours"
      },
      {
        "id": "business-dashboard",
        "name": "Business Performance Dashboard",
        "track": "Data Analytics",
        "difficulty": "Advanced",
        "level": 3,
        "description": "Build a dashboard that shows how a small business performed across the year.",
        "outcome": "A one-page dashboard with key numbers, trend charts and three recommendations for the owner.",
        "objective": "Bring cleaning, SQL, charts and written insight together in one dashboard a business owner could use.",
        "skills": [
          "Data cleaning",
          "SQL",
          "Dashboard design",
          "Business recommendations"
        ],
        "tools": [
          "SQL",
          "Google Sheets or Excel",
          "Looker Studio (optional)"
        ],
        "produce": [
          "A cleaned dataset built from at least two tables",
          "A dashboard with four or more charts",
          "A written summary with three recommendations"
        ],
        "time": "6 to 8 hours"
      },
      {
        "id": "landing-page",
        "name": "Responsive Landing Page",
        "track": "Web Development",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Build a one-page website for a small business that looks good on any screen.",
        "outcome": "A published landing page with a header, a few sections, a call-to-action button and a footer.",
        "objective": "Practice the basics of HTML structure and CSS layout by making one clean, mobile-friendly page.",
        "skills": [
          "Semantic HTML",
          "CSS layout",
          "Media queries"
        ],
        "tools": [
          "HTML",
          "CSS",
          "A code editor",
          "GitHub Pages"
        ],
        "produce": [
          "An index.html and style.css",
          "A layout that works on phone and desktop",
          "A live link to your page"
        ],
        "time": "3 to 4 hours"
      },
      {
        "id": "portfolio-website",
        "name": "Personal Portfolio Website",
        "track": "Web Development",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Create a small website that introduces you and shows the projects you have built.",
        "outcome": "A multi-section portfolio with an about section, a projects list and contact links.",
        "objective": "Present yourself and your work in a simple, professional website you can share with others.",
        "skills": [
          "HTML",
          "CSS",
          "Links and images",
          "Basic design choices"
        ],
        "tools": [
          "HTML",
          "CSS",
          "A code editor",
          "GitHub Pages"
        ],
        "produce": [
          "A portfolio page with at least three sections",
          "Links to two or more of your projects",
          "A live link to your portfolio"
        ],
        "time": "4 to 5 hours"
      },
      {
        "id": "contact-form",
        "name": "Contact Form with Validation",
        "track": "Web Development",
        "difficulty": "Intermediate",
        "level": 2,
        "description": "Build a contact form that checks what people type before it accepts it.",
        "outcome": "A working form that shows clear messages for mistakes and a thank-you message when it is filled in correctly.",
        "objective": "Use JavaScript to respond to what a visitor types, and guide them to fix problems.",
        "skills": [
          "HTML forms",
          "JavaScript events",
          "Conditional logic",
          "DOM manipulation"
        ],
        "tools": [
          "HTML",
          "CSS",
          "JavaScript"
        ],
        "produce": [
          "A form with name, email and message fields",
          "Error messages for empty or invalid fields",
          "A success message that appears without a page refresh"
        ],
        "time": "4 to 5 hours"
      },
      {
        "id": "interactive-quiz",
        "name": "Interactive Quiz Website",
        "track": "Web Development",
        "difficulty": "Advanced",
        "level": 3,
        "description": "Build a quiz that asks questions, scores the answers and shows the result.",
        "outcome": "A complete quiz with at least eight questions, a score and a restart button.",
        "objective": "Combine arrays, objects, functions and event listeners to build a small but complete web application.",
        "skills": [
          "JavaScript arrays and objects",
          "Functions",
          "Event listeners",
          "Responsive design"
        ],
        "tools": [
          "HTML",
          "CSS",
          "JavaScript",
          "GitHub Pages"
        ],
        "produce": [
          "A quiz that stores its questions in an array of objects",
          "A score shown at the end, with a restart button",
          "A live link to your quiz"
        ],
        "time": "6 to 8 hours"
      }
    ];

    let tasks = JSON.parse(JSON.stringify(startingTasks));

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function fail(status, message) {
        const error = new Error(message);
        error.status = status;
        return error;
    }

    function parseId(value) {
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    }

    function matchesAllWords(text, words) {
        const haystack = text.toLowerCase();
        return words.every(function (word) { return haystack.includes(word); });
    }

    function search(query) {
        const clean = (query || "").trim();
        const words = clean.toLowerCase().split(/\s+/).filter(function (word) { return word !== ""; });
        if (words.length === 0) {
            return { query: "", tasks: [], challenges: [], total: 0 };
        }
        const foundTasks = tasks.filter(function (task) {
            return matchesAllWords([task.title, task.description, task.objective, task.skills.join(" "), task.produce.join(" ")].join(" "), words);
        });
        const foundChallenges = challenges.filter(function (item) {
            return matchesAllWords([item.name, item.track, item.difficulty, item.description, item.skills.join(" "), item.tools.join(" ")].join(" "), words);
        });
        return { query: clean, tasks: copy(foundTasks), challenges: copy(foundChallenges), total: foundTasks.length + foundChallenges.length };
    }

    // Same job as the routes in the backend, but it returns data instead of sending a response.
    function handle(method, fullPath, body) {
        const url = new URL(fullPath, "http://demo.local");
        const path = url.pathname;

        if (method === "GET" && path === "/api/health") {
            return { status: "ok" };
        }
        if (method === "GET" && path === "/api/search") {
            return search(url.searchParams.get("q"));
        }
        if (method === "GET" && path === "/api/challenges") {
            const track = url.searchParams.get("track");
            const difficulty = url.searchParams.get("difficulty");
            return copy(challenges.filter(function (item) {
                return (!track || item.track === track) && (!difficulty || item.difficulty === difficulty);
            }));
        }
        const challengeMatch = path.match(/^\/api\/challenges\/([^/]+)$/);
        if (method === "GET" && challengeMatch) {
            const wanted = decodeURIComponent(challengeMatch[1]);
            const found = challenges.find(function (item) { return item.id === wanted; });
            if (!found) {
                throw fail(404, "Challenge \"" + wanted + "\" was not found.");
            }
            return copy(found);
        }
        if (method === "GET" && path === "/api/tasks") {
            return copy(tasks);
        }
        if (method === "POST" && path === "/api/reset") {
            tasks = copy(startingTasks);
            return copy(tasks);
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
                return copy(task);
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
            return copy(task);
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