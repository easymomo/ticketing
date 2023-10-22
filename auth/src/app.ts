import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

// import axios from "axios";
// const cors = require("cors");

import {currentUserRouter} from "./routes/authentication/current-user";
import {signUpRouter} from "./routes/authentication/sign-up";
import {signInRouter} from "./routes/authentication/sign-in";
import {signOutRouter} from "./routes/authentication/sign-out";

import {errorHandler, NotFoundError} from "@cambonu/common";

const app = express();
app.set("trust proxy", true); // Trust traffic from ingress-nginx
// app.use(cors());
// For parsing application/json
app.use(express.json());
// For parsing application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
    signed: false, // Disable encryption
    secure: process.env.NODE_ENV !== "test" // Cookies will be used over HTTPS when not in test environment
}));

app.use(currentUserRouter, signUpRouter, signInRouter, signOutRouter);

app.all("*", async (req, res, next) => {
    new NotFoundError();
});

app.use(errorHandler);

export {app};
