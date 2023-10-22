import {Listener, OrderCreatedEvent, Subjects} from "@cambonu/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("Waiting this many milliseconds to process the job: ", delay);

        // Adding a job to the queue
        await expirationQueue.add("order:expiration", {
            orderId: data.id
        }, {
            delay // the delay is expressed in milliseconds
        });

        msg.ack();
    }
}
