import express, {Request, Response} from "express";
import {body} from "express-validator";
import {requireAuth, validateRequest} from "@cambonu/common";
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsWrapper} from "../nats-wrapper";

// We will mock natsWrapper so Jest will use the fake implementation instead of the real one
// jest.mock("../nats-wrapper");

const router = express.Router();

router.post("/api/tickets",
    requireAuth,
    [
        body("title") // Step 1: We add the code for the validation
            .not()
            .isEmpty()
            .withMessage("Title is required"),
        body("price")
            .isFloat({gt: 0}) // greater than 0, we do not accept negative values
            .withMessage("The price must be greater than 0")
    ],
    validateRequest, // Step 2: We add the validateRequest middleware to process the errors
    async (req: Request, res: Response) => {
        const {title, price} = req.body;

        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id // the requireAuth middleware makes sure this is defined
        });

        await ticket.save();

        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.status(201).send(ticket);
    });

export {router as createTicketRouter}
