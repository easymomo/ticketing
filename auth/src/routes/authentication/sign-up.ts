import express, {Request, Response} from "express";
import {body} from "express-validator";
import jwt from "jsonwebtoken";

import {User} from "../../models/user";

import {validateRequest, BadRequestError} from "@cambonu/common";

const router = express.Router();

router.post("/api/users/sign-up", [
        body("email")
            .isEmail()
            .withMessage("Email must be valid"),
        body("password")
            .trim()
            .isLength({min: 4, max: 20})
            .withMessage("Password must be between 4 and 20 characters")
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const {email, password} = req.body;

        const existingUser = await User.findOne({email});

        if (existingUser) {
            throw new BadRequestError("Email already in use");
        }

        const user = User.build({email, password});
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign({
                id: user.id,
                email: user.email
            },
            process.env.JWT_KEY! // The check for this env var is done in the index
        );

        // Store it on session object
        // The cookie-session library is going to serialize the object and then send it back to the user's browser
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    });

export {router as signUpRouter};
