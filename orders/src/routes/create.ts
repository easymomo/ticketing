import express, {Request, Response} from "express";
import {body} from "express-validator";
import {BadRequestError, NotFoundError, requireAuth, validateRequest} from "@cambonu/common";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {Order, OrderStatus} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

// We will mock natsWrapper so Jest will use the fake implementation instead of the real one
// jest.mock("../nats-wrapper");

const router = express.Router();

// Window of time the user has to pay for the order
const EXPIRATION_WINDOW_SECONDS = 60; // 15 * 60 = 900, 60s === 1min and we multiply this by 15 to get 15 minutes

router.post("/api/orders",
    requireAuth,
    [
        body("ticketId") // Step 1: We add the code for the validation
            .not()
            .isEmpty()
            // Check the format of the ticket id, to make sure it corresponds to a mongo id
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage("TicketId must be provided"),
        /*body("price")
            .isFloat({gt: 0}) // greater than 0, we do not accept negative values
            .withMessage("The price must be greater than 0"),*/
    ],
    validateRequest, // Step 2: We add the validateRequest middleware to process the errors
    async (req: Request, res: Response) => {
        const {ticketId} = req.body;

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);
        if(!ticket) {
            throw new NotFoundError();
        }

        // Make sure that this ticket is not already reserved
        const isReserved = await ticket.isReserved();
        if(isReserved) {
            throw new BadRequestError("The ticket is already reserved");
        }

        // Calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // Build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();

        // Publish an event saying that an order was created
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            // We set the date as a string because when the data here is turned into json, it is done with
            // the current timezone which is bad, UTC is better because it is universal.
            // We will turn the date into an ISO string to prevent that issue from happening
            expiresAt: order.expiresAt.toISOString(), // this will give us a UTC timestamp
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        });

        res.status(201).send(order);
    });

export {router as createOrderRouter}
