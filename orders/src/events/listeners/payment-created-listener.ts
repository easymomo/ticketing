import {Subjects, Listener, PaymentCreatedEvent} from "@cambonu/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order, OrderStatus} from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId);

        if(!order) {
            throw new Error("Order not found");
        }

        order.set({
            status: OrderStatus.Complete,
        });
        await order.save();

        // TODO: Publish an event saying that the order was updated, but we're not doing that for now
        // because once the order is complete, we are not going to update it again

        msg.ack();
    }
}
