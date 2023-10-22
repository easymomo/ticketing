import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import {errorHandler, NotFoundError, currentUser} from "@cambonu/common";

import {createTicketRouter} from "./routes/create";
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";

const app = express();
app.set("trust proxy", true); // Trust traffic from ingress-nginx
// express.json() is a built in middleware function in Express. It parses incoming JSON requests and puts the
// parsed data in req.body
app.use(express.json());

app.use(cookieSession({
    signed: false, // Disable encryption
    secure: process.env.NODE_ENV !== "test" // Cookies will be used over HTTPS when not in test environment
}));

// use the currentUser middleware
app.use(currentUser); // Has to be added after cookieSession because cookieSession sets up req.session

app.use(createTicketRouter, showTicketRouter, indexTicketRouter, updateTicketRouter);

app.all("*", async (req, res, next) => {
    new NotFoundError();
});

app.use(errorHandler);

export {app};
