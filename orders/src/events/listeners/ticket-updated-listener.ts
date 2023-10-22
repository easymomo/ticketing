import {Message} from "node-nats-streaming";
import {Listener, Subjects, TicketUpdatedEvent} from "@cambonu/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;
    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        // We look for the ticket with the same id and the version -1, so we are sure to maintain the sequence.
        // Only the ticket with the following version can be used to update an existing ticket
        const ticket = await Ticket.findByEvent(data);

        if(!ticket) {
            throw new Error("Ticket not found");
        }

        const {title, price} = data;
        ticket.set({title, price});
        // await is very important here, if missing, the function ack will be called even if the next
        // function fails
        await ticket.save();

        msg.ack();
    }
}
