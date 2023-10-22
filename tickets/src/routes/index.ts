import express, {Request, Response} from "express";
import {Ticket} from "../models/ticket";
import {NotFoundError} from "@cambonu/common";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response)=> {
    // Ticket.find({}) is like SELECT * FROM tickets, it fetches everything
    const tickets = await Ticket.find({
        orderId: undefined
    });

    if(!tickets) {
        throw new NotFoundError();
    }

    res.send(tickets); // Sends by default 200 if no status is defined
});

export {router as indexTicketRouter};
