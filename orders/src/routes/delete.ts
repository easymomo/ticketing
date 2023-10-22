import express, {Request, Response} from "express";
import {NotAuthorizedError, NotFoundError} from "@cambonu/common";
import {Order, OrderStatus} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete("/api/orders/:orderId", async (req: Request, res: Response)=> {
    // IMPORTANT to populate the ticket when getting
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if(!order) {
        throw new NotAuthorizedError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotFoundError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Send the event
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        }
    });

    // The HTTP code for resource successfully deleted is 204 No Content. This status code indicates that the server
    // has successfully processed the request and deleted the resource, but there is no content to send back in the
    // response.
    res.status(204).send(order); // We send back a 204 but the order is not really deleted from the database
});

export {router as deleteOrderRouter};
