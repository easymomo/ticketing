import {OrderCancelledEvent, Publisher, Subjects} from "@cambonu/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
