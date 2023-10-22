import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {OrderCreatedEvent, OrderStatus} from "@cambonu/common";
import {Ticket} from "../../../models/ticket";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedListener} from "../order-created-listener";

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        title: "concert",
        price: 99,
        userId: "asdf"
    });
    await ticket.save();

    // Create the fake data event
    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: "asdf",
        expiresAt: "asdf",
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    // Create the fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // Return all of this stuff
    return {listener, ticket, data, msg};
}

it("sets the orderId of the ticket", async () => {
    const {listener, ticket, data, msg} = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
    const {listener, data, msg} = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
    const {listener, data, msg} = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // Get the mock function and check the arguments
    // @ts-ignore
    // console.log(natsWrapper.client.publish.mock.calls[0][1]);
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});
