import {Message} from "node-nats-streaming";
import {Listener, OrderCreatedEvent, Subjects} from "@cambonu/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw error
        if(!ticket) {
            throw new Error("Ticket not found");
        }

        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({orderId: data.id});

        // Save the ticket
        await ticket.save();

        // Publish a ticket updated event (to keep the version numbers sync)
        // The base listener class has a nats client protected property, allowing us to access it in this
        // child class with this.client
        // await is very important here, if missing, the function ack will be called even if the next
        // function fails
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
        });

        // Ack the message
        msg.ack();
    }
}
