import express, {Request, Response} from "express";
import {body} from "express-validator";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError, BadRequestError,
} from "@cambonu/common";
import {Ticket} from "../models/ticket";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";

// We will mock natsWrapper so Jest will use the fake implementation instead of the real one
// jest.mock("../nats-wrapper");

const router = express.Router();

router.put("/api/tickets/:id",
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
        const ticket = await Ticket.findById(req.params.id);

        if(!ticket) {
            throw new NotFoundError();
        }

        if(ticket.orderId) {
            throw new BadRequestError("Cannot edit a reserved ticket");
        }

        if(ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        });

        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.send(ticket);
    }
);

export {router as updateTicketRouter};
