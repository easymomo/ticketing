import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import {errorHandler, NotFoundError, currentUser} from "@cambonu/common";

import {createOrderRouter} from "./routes/create";
import {showOrderRouter} from "./routes/show";
import {indexOrderRouter} from "./routes";
import {deleteOrderRouter} from "./routes/delete";

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

app.use(createOrderRouter, showOrderRouter, indexOrderRouter, deleteOrderRouter);

app.all("*", async (req, res, next) => {
    new NotFoundError();
});

app.use(errorHandler);

export {app};
