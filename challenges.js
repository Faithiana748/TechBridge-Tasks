/* ==========================================================
   TechBridge | Challenge routes
   Mounted at /api/challenges in server.js
     GET /api/challenges        all challenges
                                optional filters: ?track=Data Analytics&difficulty=Beginner
     GET /api/challenges/:id    one challenge, for example /api/challenges/sales-analysis
   ========================================================== */

const express = require("express");
const store = require("../store");

const router = express.Router();

// GET /api/challenges  ->  an array of challenges (filtered if a track or difficulty is given)
router.get("/", function (req, res) {
    const track = req.query.track;
    const difficulty = req.query.difficulty;

    const result = store.getChallenges().filter(function (challenge) {
        if (track && challenge.track !== track) {
            return false;
        }
        if (difficulty && challenge.difficulty !== difficulty) {
            return false;
        }
        return true;
    });

    res.json(result);
});

// GET /api/challenges/sales-analysis  ->  one challenge
router.get("/:id", function (req, res) {
    const challenge = store.getChallenges().find(function (item) { return item.id === req.params.id; });
    if (!challenge) {
        return res.status(404).json({ error: "Challenge \"" + req.params.id + "\" was not found." });
    }
    res.json(challenge);
});

module.exports = router;