import {Message} from "node-nats-streaming";
import {Listener, OrderCancelledEvent, Subjects} from "@cambonu/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw error
        if(!ticket) {
            throw new Error("Ticket not found");
        }

        // Mark the ticket as being NOT reserved anymore by setting its orderId property to undefined
        // We are using undefined here instead of null because TypeScript's optional values checks with ?
        // will have trouble working with null
        ticket.set({orderId: undefined});

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
            version: ticket.version
        });

        // Ack the message
        msg.ack();
    }
}
