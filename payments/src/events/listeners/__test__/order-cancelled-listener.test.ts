import mongoose from "mongoose";
import { OrderCancelledEvent, OrderStatus } from "@cambonu/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create and save a ticket
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: "test",
        version: 0
    });
    await order.save();

    // Create a fake data event
    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: 1,
        ticket: {
            id: "test"
        }
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, msg };
}

it("updates the status of the order", async () => {
    const { listener, order, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure the ticket was created
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
    const { listener, order, data, msg } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch(err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
});
