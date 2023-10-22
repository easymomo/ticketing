import express, {Request, Response} from "express";
import {NotFoundError} from "@cambonu/common";
import {Ticket} from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response)=> {
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket) {
        throw new NotFoundError();
    }

    res.send(ticket); // Sends by default 200 if no status is defined
});

export {router as showTicketRouter};
