import {Message} from "node-nats-streaming";
import {OrderCancelledEvent, Subjects, Listener, OrderStatus} from "@cambonu/common";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // We look for the order with the same id and the version -1, so we are sure to maintain the sequence.
        // Only the order with the following version can be used to update an existing order
        const order = await Order.findByEvent(data);

        if(!order) {
            throw new Error("Order not found");
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    }
}
