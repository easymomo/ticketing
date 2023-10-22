import express, {Request, Response} from "express";
import {Order} from "../models/order";
import {NotAuthorizedError, NotFoundError} from "@cambonu/common";

const router = express.Router();

router.get("/api/orders/:orderId", async (req: Request, res: Response)=> {
    const order = await Order.findById(req.params.orderId).populate("ticket")
    if(!order) {
        throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    res.send(order); // Sends by default 200 if no status is defined
});

export {router as showOrderRouter};
