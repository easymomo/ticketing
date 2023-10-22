import {Publisher, Subjects, TicketUpdatedEvent} from "@cambonu/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
