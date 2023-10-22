import {Listener, Subjects, TicketCreatedEvent} from "@cambonu/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    // With this 2 steps process, TypeScript enforces us to never be able to change that subject
    // property at any point in time
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    // The Message property of the function below comes from nats
    // It has the ack() method called after successfully processing a message
    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        const {id, title, price} = data;
        const ticket = Ticket.build({
            id, title, price
        });
        // await is very important here, if missing, the function ack will be called even if the next
        // function fails
        await ticket.save();

        msg.ack();
    }
}
