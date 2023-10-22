import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {TicketUpdatedEvent} from "@cambonu/common";
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 10,
    });
    await ticket.save();

    // create a fake data event
    const data: TicketUpdatedEvent["data"] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: "New Concert",
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake message object
    // We only care about the ack() function on the Message object, we will mock it
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, ticket};
};

it("finds, updates, and saves a ticket", async () => {
    const {listener, data, msg, ticket} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acknowledges a message", async () => {
    const {listener, data, msg} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
    const {listener, data, msg, ticket} = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (e) {
    }

    expect(msg.ack).not.toHaveBeenCalled();
});
