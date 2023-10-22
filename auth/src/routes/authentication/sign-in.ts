import express, {Request, Response} from "express";
import { body } from "express-validator";

import {PasswordManager} from "../../services/password-manager";
import {User} from "../../models/user";
import {validateRequest, BadRequestError} from "@cambonu/common";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/api/users/sign-in", [
    body("email")
        .isEmail()
        .withMessage("Email must be valid"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("You must supply a password")
],
    validateRequest,
    async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if(!existingUser) {
        throw new BadRequestError("Login failed");
    }

    const passwordMatch = await PasswordManager.compare(
        existingUser.password,
        password
    );

    if(!passwordMatch) {
        throw new BadRequestError("Login failed");
    }

    // Generate JWT
    const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        },
        process.env.JWT_KEY! // The check for this env var is done in the index
    );

    // Store it on session object
    // The cookie-session library is going to serialize the object and then send it back to the user's browser
    req.session = {
        jwt: userJwt
    };

    res.status(200).send(existingUser);
});

export { router as signInRouter };
