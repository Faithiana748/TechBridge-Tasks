/* ==========================================================
   TechBridge | Shared API helper (used by the Challenge Hub and Search)
   Plain JavaScript. No frameworks, no libraries.
   ----------------------------------------------------------
   One place that knows how to talk to the backend:

     TechBridgeApi.request("/api/challenges")  ->  Promise with the JSON answer

   Where is this page running?
     localhost / file  -> call the real Express backend
     anywhere else     -> a static host (like GitHub Pages) has no backend,
                          so the answer comes from the demo API in demo-api.js
   ========================================================== */

(function () {
    const IS_LOCAL = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

    // If the page is served by the Express server (port 3000), "/api/..." is enough.
    // If it is opened some other way (Live Server, a double-click), use the full address.
    const API_BASE = IS_LOCAL && window.location.port !== "3000" ? "http://localhost:3000" : "";

    let demoMode = !IS_LOCAL;

    // An error with extra details.
    //   offline = true  -> the server could not be reached (or did not answer with JSON)
    //   offline = false -> the server answered, but with an error (for example 404)
    function makeApiError(message, status, offline) {
        const error = new Error(message);
        error.status = status;
        error.offline = offline;
        return error;
    }

    async function request(path) {
        if (demoMode) {
            if (!window.TechBridgeDemoApi) {
                throw makeApiError("The demo API is not available.", 0, true);
            }
            try {
                return await window.TechBridgeDemoApi.request("GET", path);
            } catch (error) {
                throw makeApiError(error.message, error.status || 500, false);
            }
        }

        let response;
        try {
            response = await fetch(API_BASE + path);
        } catch (networkError) {
            throw makeApiError("The backend could not be reached.", 0, true);
        }

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw makeApiError("The server did not send JSON.", response.status, true);
        }

        if (!response.ok) {
            throw makeApiError(data && data.error ? data.error : "The server returned an error.", response.status, false);
        }
        return data;
    }

    // A friendly sentence for an error.
    function describeError(error) {
        if (error.offline && !demoMode) {
            return "The backend is not responding. Start it with npm start in the backend folder.";
        }
        return error.message;
    }

    window.TechBridgeApi = {
        request: request,
        describeError: describeError,
        isDemo: function () { return demoMode; },
        isLocal: IS_LOCAL,
        setDemo: function (value) { demoMode = Boolean(value); }
    };
})();