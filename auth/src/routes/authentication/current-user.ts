import express from "express";

// We import the currentUser middleware and use it on this route to extract the info
import {currentUser} from "@cambonu/common";

const router = express.Router();

router.get("/api/users/current-user",
    currentUser,
    (req, res) => {
    // If the current user is set, send it back, if not, send currentUser = null
    res.send({currentUser: req.currentUser || null});
});

export {router as currentUserRouter};
